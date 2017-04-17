/**
 * Created by syuchan on 2017/03/12.
 */
import Path from "path";
import fs from "fs";

import Koa from "koa";
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

import DBConnector from "./module/DBConnector";
import MusicLoader from "./module/MusicLoader";
import ThemeLoader from "./module/ThemeLoader";
import Util from "./module/Util";

const app = websockify(new Koa());
const router = Router();
const settingRouter = Router();
const connector = new DBConnector({type: "sqlite", database: "test.db", version: "0.0.1"});
connector.createTable();
const musicLoader = new MusicLoader(process.env.F_PATH, connector);
const themeLoader = new ThemeLoader(connector);
const write = debug("soundme");
let hbsIndex;
fs.readFile(Path.join(__dirname, "views", "index.hbs"), 'utf8', function (err, data) {
    hbsIndex = Handlebars.compile(data);
});

app.keys = ["need change this value"];

app.use(bodyParser());

app.use(session({key: 'SoundME'}, app));

app.use(hbs({defaultLayout: 'main'}));

let idCheck = async function (ctx, next) {
    if (!(ctx.url === "/" || ctx.session.userId)) {
        ctx.session = undefined;
        ctx.response.redirect("/");
    } else {
        await next();
    }
};
idCheck.unless = unless;
app.use(idCheck.unless({path: ["/"], ext: ["css", "js", "ico", "woff", "ttf"]}));

router.get("/", async function (ctx, next) {
    if (ctx.session.userId) {
        ctx.response.redirect("/albums");
    } else {
        ctx.body = hbsIndex({
            theme: connector.getThemeFolder(connector.getSetting().default_theme)
        });
    }
});

router.post("/", async function (ctx, next) {
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

router.get("/logout", async function (ctx, next) {
    ctx.session = null;
    ctx.response.redirect("/");
});

router.get("/artist", async function (ctx, next) {
    ctx.body = await ctx.renderView("artist", {
        theme: connector.getThemeFolder(ctx.session.theme),
        role: connector.getUser(ctx.session.userId).role === "admin",
        list: connector.getArtists()
    });
});

router.get("/artist/:name", async function (ctx, next) {
    const artist = ctx.params.name;
    const artistAlbums = connector.getArtistAlbums(artist);
    const albumIds = artistAlbums.map((v) => v.id);
    const artistSongs = connector.getArtistSongs(artist).filter((e, i, d) => !albumIds.includes(e.album));
    const data = {
        theme: connector.getThemeFolder(ctx.session.theme),
        role: connector.getUser(ctx.session.userId).role === "admin",
        data: []
    };
    artistAlbums.forEach((albumData) => data.data.push({
        album: albumData,
        songs: connector.getAlbumSongs(albumData.id)
    }));
    artistSongs.sort((s1, s2) => s1.id - s2.id);
    artistSongs.forEach((songData) => {
        const albumData = data.data[data.data.length - 1];
        if (albumData !== undefined && albumData.album.id === songData.album) albumData.songs.push(songData);
        else data.data.push({album: connector.getAlbum(songData.album), songs: [songData]});
    });
    data.data.sort((s1, s2) => Util.katakanaToHiragana(s1.album.name).localeCompare(Util.katakanaToHiragana(s2.album.name)));
    ctx.body = await ctx.renderView("category-album", data);
});

router.get("/albums", async function (ctx, next) {
    ctx.body = await ctx.renderView("albums", {
        theme: connector.getThemeFolder(ctx.session.theme),
        role: connector.getUser(ctx.session.userId).role === "admin",
        albums: connector.getAlbums()
    });
});

router.get("/albums/:id", async function (ctx, next) {
    ctx.body = await ctx.renderView("album", {
        theme: connector.getThemeFolder(ctx.session.theme),
        album: connector.getAlbum(ctx.params.id),
        songs: connector.getAlbumSongs(ctx.params.id)
    });
});

router.get("/songs", async function (ctx, next) {
    const songs = connector.getFullSongs();
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
    const song = connector.getSong(ctx.params.id);
    delete song.source_path;
    if (song === undefined) {
        await next;
    } else {
        ctx.body = song;
    }
});

router.get("/genre", async function (ctx, next) {
    ctx.body = await ctx.renderView("genre", {
        theme: connector.getThemeFolder(ctx.session.theme),
        role: connector.getUser(ctx.session.userId).role === "admin",
        list: connector.getGenres()
    });
});

router.get("/genre/:name", async function (ctx, next) {
    const genre = ctx.params.name;
    const data = {
        theme: connector.getThemeFolder(ctx.session.theme),
        role: connector.getUser(ctx.session.userId).role === "admin",
        data: []
    };
    connector.getGenreAlbums(genre).forEach((album) => {
        data.data.push({
            album: album,
            songs: connector.getAlbumSongs(album.id)
        })
    });
    ctx.body = await ctx.renderView("category-album", data);
});

settingRouter
    .get("/", async function (ctx, next) {
        if (connector.getUser(ctx.session.userId).role !== "admin") {
            ctx.response.redirect("/albums");
        } else {
            const setting = connector.getSetting();
            const cnvSrc = setting.cnv_src;
            ctx.body = await ctx.renderView("setting", {
                theme: connector.getThemeFolder(ctx.session.theme),
                role: connector.getUser(ctx.session.userId).role === "admin",
                users: connector.getUsers(),
                music_path: setting.music_path,
                theme_name: setting.default_theme,
                src_mp3: cnvSrc.includes("MP3"),
                src_ogg: cnvSrc.includes("OGG"),
                src_aac: cnvSrc.includes("AAC"),
                src_flac: cnvSrc.includes("FLAC"),
                src_wma: cnvSrc.includes("WMA"),
            });
        }
    })
    .post("/", async function (ctx, next) {
        if (connector.getUser(ctx.session.userId).role !== "admin") {
            ctx.response.redirect("/albums");
        } else {
            let body = ctx.request.body;
            connector.updateSetting(body.music_path, body.src, body.theme_name);
            ctx.status = 200;
        }
    })
    .delete("/reset/:ops", async function (ctx, next) {
        if (connector.getUser(ctx.session.userId).role !== "admin") {
            ctx.response.redirect("/albums");
        } else {
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
        }
    })
    .post("/user", async function (ctx, next) {
        if (connector.getUser(ctx.session.userId).role !== "admin") {
            ctx.response.redirect("/albums");
        } else {
            const body = ctx.request.body;
            connector.addUser(body.username, body.hash, body.role);
            ctx.status = 200;
        }
    })
    .put("/user", async function (ctx, next) {
        if (connector.getUser(ctx.session.userId).role !== "admin") {
            ctx.response.redirect("/albums");
        } else {
            const body = ctx.request.body;
            connector.changeRole(body.userid, body.username, body.role);
            ctx.status = 200;
        }
    })
    .delete("/user", async function (ctx, next) {
        if (connector.getUser(ctx.session.userId).role !== "admin") {
            ctx.response.redirect("/albums");
        } else {
            const body = ctx.request.body;
            connector.deleteUser(body.userid, body.username, body.role);
            ctx.status = 200;
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

app.use(async function (ctx, next) {
    ctx.response.redirect("/");
});

app.on("error", function (err) {
    write(err);
});

console.log("listening port: 3000");
app.listen(3000);