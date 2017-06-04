/**
 * Created by syuchan on 2017/03/12.
 */
import Path from "path";
import fs from "fs";
import URL from "url";

import Koa from "koa";
import koaBody from "koa-body";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import Route from "koa-route";
import Serve from "koa-static";
import Range from "koa-range";
import unless from "koa-unless";
import hbs from "koa-handlebars";
import session from "koa-session";
import websockify from "koa-websocket";
import debug from "debug";
import Handlebars from "handlebars";
import extractZip from "extract-zip";

import DBConnector from "./module/DBConnector";
import MusicLoader from "./module/MusicLoader";
import ThemeLoader from "./module/ThemeLoader";
import Util from "./module/Util";

const app = websockify(new Koa());
const router = Router();
const settingRouter = Router();
const connector = DBConnector.createInstance({type: "sqlite", database: "test.db", version: "1.0.0"});
connector.createTable();
if (!connector.existAdmin()) {
    const user = Util.createRandomString(8);
    const pass = Util.createRandomString(16);
    connector.addUserPassword(user, pass, "admin");
    console.log(`Create First Admin User.\nUserName: ${user}\nPassword: ${pass}\n\u001b[1;31mYou need to create new AdminUser.\u001b[0m\n`);
}
const musicLoader = new MusicLoader(process.env.F_PATH, connector);
const themeLoader = new ThemeLoader(connector);
themeLoader.loadAllThemes();
const write = debug("soundme");
Handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});
let hbsIndex;
fs.readFile(Path.join(__dirname, "views", "index.hbs"), 'utf8', function (err, data) {
    hbsIndex = Handlebars.compile(data);
});

app.keys = ["need change this value"];

app.use(bodyParser());

app.use(session({key: 'SoundME'}, app));

app.use(hbs({defaultLayout: 'main', handlebars: Handlebars}));

let idCheck = async function (ctx, next) {
    if (ctx.session.userId || Path.basename(ctx.url) === "icon.png" ||
        Path.extname(ctx.url) === ".mp3" && URL.parse(ctx.request.header.referer).pathname !== "/") {
        await next();
    } else {
        ctx.response.redirect("/");
    }
};
idCheck.unless = unless;
app.use(idCheck.unless({path: ["/"], ext: ["css", "js", "ico", "woff", "ttf"]}));

router.get("/empty", async function (ctx) {
    ctx.body = "";
});

router.get("/", async function (ctx) {
    if (ctx.session.userId) {
        ctx.response.redirect("/albums");
    } else {
        ctx.body = hbsIndex({
            theme: connector.getThemeFolder(connector.getSetting().default_theme),
            baseUrl: ctx.href
        });
    }
});

router.post("/", async function (ctx) {
    const id = connector.getUserId(ctx.request.body.name, ctx.request.body.passhash);
    if (id === undefined) {
        ctx.session.userId = undefined;
        ctx.status = 401;
        ctx.body = "wrong name";
    } else {
        ctx.session.userId = id;
        ctx.session.theme = connector.getSetting().default_theme;
        ctx.body = "set userId";
    }
});

router.get("/logout", async function (ctx) {
    ctx.session = null;
    ctx.body = "OK";
});

router.get("/albums", async function (ctx) {
    const user = connector.getUser(ctx.session.userId);
    const albumIds = connector.getFullSongs().filter((e) => Util.hasPerm(e, user.role))
        .map((song) => song.album_id).filter((x, i, s) => s.indexOf(x) === i);
    const albumData = connector.getAlbums().filter((e) => albumIds.includes(e.id));
    albumData.forEach((e) => {
        if (e.thumbnail !== "/no_art.png") e.thumbnail = MusicLoader.insertBeforeExt(e.thumbnail, "_big");
    });
    ctx.body = await ctx.renderView("albums", {
        theme: connector.getThemeFolder(ctx.session.theme),
        role: user.role === "admin",
        albums: albumData
    });
});

router.get("/albums/:id", async function (ctx) {
    const songs = connector.getAlbumSongs(ctx.params.id).filter((e) => Util.hasPerm(e, connector.getUser(ctx.session.userId).role));
    if (songs.length !== 0) {
        const albumData = connector.getAlbum(ctx.params.id);
        if (albumData.thumbnail !== "/no_art.png") albumData.thumbnail = MusicLoader.insertBeforeExt(albumData.thumbnail, "_big");
        ctx.body = await ctx.renderView("album", {
            theme: connector.getThemeFolder(ctx.session.theme),
            album: albumData,
            songs: songs
        });
    }
});

router.get("/songs", async function (ctx) {
    const songs = connector.getFullSongs().filter((e) => Util.hasPerm(e, connector.getUser(ctx.session.userId).role));
    songs.forEach(song => {
        const len = song.length / 1000.0;
        song.min = ('   ' + Math.floor(len / 60)).slice(-3);
        song.sec = ('00' + Math.floor(len % 60)).slice(-2);
    });
    ctx.body = await ctx.renderView("songs", {
        theme: connector.getThemeFolder(ctx.session.theme),
        role: connector.getUser(ctx.session.userId).role === "admin",
        songs: songs
    });
});

router.get("/songs/:id", async function (ctx, next) {
    const song = connector.getSongAndThumbnail(ctx.params.id);
    if (song === undefined) {
        await next;
    } else if (Util.hasPerm(song, connector.getUser(ctx.session.userId).role)) {
        ctx.body = song;
    }
});

router.get("/category/:type", async function (ctx) {
    const role = connector.getUser(ctx.session.userId).role;
    ctx.body = await ctx.renderView("category", {
        theme: connector.getThemeFolder(ctx.session.theme),
        role: role === "admin",
        page: ctx.params.type,
        list: (ctx.params.type === "artist" ? connector.getArtists(role) : connector.getGenres(role)).map((e) => e[ctx.params.type])
    });
});

router.get("/category/:type/:name", async function (ctx) {
    const user = connector.getUser(ctx.session.userId);
    const data = {
        theme: connector.getThemeFolder(ctx.session.theme),
        role: connector.getUser(ctx.session.userId).role === "admin",
        data: []
    };
    if (ctx.params.type === "artist") {
        connector.getArtistSongs(ctx.params.name)
            .filter((e) => Util.hasPerm(e, user.role))
            .sort((s1, s2) => s1.id - s2.id)
            .forEach((songData) => {
                    const albumData = data.data[data.data.length - 1];
                    if (albumData !== undefined && albumData.album.id === songData.album) {
                        albumData.songs.push(songData);
                    } else {
                        const albumData = connector.getAlbum(songData.album);
                        if (albumData.thumbnail !== "/no_art.png") albumData.thumbnail = MusicLoader.insertBeforeExt(albumData.thumbnail, "_big");
                        data.data.push({album: albumData, songs: [songData]});
                    }
                }
            );
        data.data.sort((s1, s2) => Util.katakanaToHiragana(s1.album.name).localeCompare(Util.katakanaToHiragana(s2.album.name)));
    } else {
        connector.getGenreAlbums(ctx.params.name).forEach((album) => {
            const songs = connector.getAlbumSongs(album.id).filter((e) => Util.hasPerm(e, user.role));
            if (songs.length !== 0) {
                if (album.thumbnail !== "/no_art.png") album.thumbnail = MusicLoader.insertBeforeExt(album.thumbnail, "_big");
                data.data.push({
                    album: album,
                    songs: songs
                })
            }
        });
    }
    ctx.body = await ctx.renderView("category-album", data);
});

settingRouter
    .use("/", async function (ctx, next) {
        if (connector.getUser(ctx.session.userId).role !== "admin") {
            ctx.response.redirect("/albums");
        } else {
            await next();
        }
    })
    .get("/", async function (ctx) {
        const setting = connector.getSetting();
        const cnvSrc = setting.cnv_src;
        ctx.body = await ctx.renderView("setting", {
            theme: connector.getThemeFolder(ctx.session.theme),
            role: connector.getUser(ctx.session.userId).role === "admin",
            users: connector.getUsers(),
            setting: setting,
            themes: connector.getThemes(),
            src_mp3: cnvSrc.includes("MP3"),
            src_ogg: cnvSrc.includes("OGG"),
            src_aac: cnvSrc.includes("AAC"),
            src_flac: cnvSrc.includes("FLAC"),
            src_wma: cnvSrc.includes("WMA"),
        });
    })
    .post("/", async function (ctx) {
        let body = ctx.request.body;
        connector.updateSetting(body.music_path, body.src, body.theme_name);
        ctx.status = 200;
    })
    .delete("/reset/:ops", async function (ctx) {
        switch (ctx.params.ops) {
            case "clear":
                MusicLoader.clearCache();
                MusicLoader.clearThumbnail();
                break;
            case "reset":
                connector.resetDB();
                break;
            case "resetall":
                MusicLoader.clearCache();
                MusicLoader.clearThumbnail();
                connector.resetDB();
                break;
        }
        ctx.status = 200;
    })
    .post("/user", async function (ctx) {
        const body = ctx.request.body;
        connector.addUser(body.username, body.hash, body.role);
        ctx.status = 200;
    })
    .put("/user", async function (ctx) {
        const body = ctx.request.body;
        connector.changeRole(body.userid, body.username, body.role);
        ctx.status = 200;
    })
    .delete("/user", async function (ctx) {
        const body = ctx.request.body;
        if (ctx.session.userId === parseInt(body.userid)) {
            ctx.body = "can't delete yourself";
            ctx.status = 400;
        } else {
            connector.deleteUser(body.userid, body.username, body.role);
            ctx.status = 200;
        }
    })
    .post("/theme", koaBody({
            multipart: true,
            formidable: {uploadDir: Path.join(__dirname, "theme")}
        }), async function (ctx) {
            const data = ctx.request.body.files.file;
            if (data === undefined || data.type !== "application/x-zip-compressed") {
                ctx.status = 400;
            } else {
                extractZip(data.path, {
                    dir: Path.join(__dirname, "theme", Path.basename(data.name, Path.extname(data.name)))
                }, function () {
                    fs.unlinkSync(data.path);
                    connector.resetThemes();
                    themeLoader.loadAllThemes();
                });
                ctx.status = 200;
            }
        }
    )
    .put("/songperm", async function (ctx) {
        try {
            const body = ctx.request.body;
            if (Array.isArray(JSON.parse(body.perm))) {
                connector.changePerm(body.songId, body.perm, body.beforePerm);
                ctx.status = 200;
            }
        } catch (e) {
            ctx.status = 400;
        }
    });

router.use("/setting", settingRouter.routes(), settingRouter.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

app.use(Range);
app.use(async function (ctx, next) {
    const url = ctx.url.split("\/");
    if (["music", "theme"].includes(url[1])) {
        url.splice(1, 1);
        ctx.url = url.join("\/");
    }
    await next();
});
const musicPath = connector.getSetting().music_path;
app.use(Serve(Path.join(__dirname, musicPath)));
app.use(Serve(Path.join(__dirname, '/theme')));
app.use(Serve(Path.join(__dirname, '/static')));

app.ws.use(Route.all('/setting/load', async function (ctx) {
    if (connector.getUser(ctx.session.userId).role === "admin") {
        await musicLoader.loadAllMusic(`${Path.join(__dirname, musicPath)}`, function (process, progress, process_file, progress_file) {
            ctx.websocket.send(JSON.stringify({
                process: process,
                progress: progress,
                process_file: process_file,
                progress_file: progress_file
            }));
        });
    }
    ctx.websocket.close();
}));

app.use(async function (ctx) {
    ctx.response.redirect("/");
});

app.on("error", function (err) {
    write(err);
});

const port = process.env.PORT || 3000;
console.log("listening port: " + port);
app.listen(port);