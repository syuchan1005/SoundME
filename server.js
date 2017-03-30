/**
 * Created by syuchan on 2017/03/12.
 */

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

import DBConnector from "./module/DBConnector";
import MusicLoader from "./module/MusicLoader";

const app = websockify(new Koa());
const router = Router();
const connector = new DBConnector({type: "sqlite", database: "test.db"});
connector.createTable();
const loader = new MusicLoader(process.env.F_PATH, connector);
const write = debug("soundme");

app.keys = ["need change this value"];

app.use(hbs({defaultLayout: 'main'}));

app.use(bodyParser());

app.use(session({key: 'SoundME'}, app));

let idCheck = async function (ctx, next) {
    if (!(ctx.url === "/" || ctx.session.userId)) {
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
        await next();
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
        ctx.body = "set userId";
    }
});

router.get("/logout", async function (ctx, next) {
    ctx.session = null;
    ctx.response.redirect("/");
});

router.get("/artist", async function (ctx, next) {
    ctx.body = await ctx.renderView("category", {
        role: connector.getUser(ctx.session.userId).role === "admin",
    });
});

router.get("/albums", async function (ctx, next) {
    ctx.body = await ctx.renderView("albums", {
        role: connector.getUser(ctx.session.userId).role === "admin",
        albums: connector.getAlbums()
    });
});

router.get("/albums/:id", async function (ctx, next) {
    ctx.body = await ctx.renderView("album", {
        album: connector.getAlbum(ctx.params.id),
        songs: connector.getAlbumSongs(ctx.params.id)
    });
});

router.get("/songs", async function (ctx, next) {
    const songs = connector.getFullSongs();
    if (songs !== undefined) {
        for (let i = 0; i < songs.length; i++) {
            const song = songs[i];
            const len = song.length / 1000.0;
            song.min = ('   ' + Math.floor(len / 60)).slice(-3);
            song.sec = ('00' + Math.floor(len % 60)).slice(-2);
        }
    }
    ctx.body = await ctx.renderView("songs", {
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
    ctx.body = await ctx.renderView("category", {
        role: connector.getUser(ctx.session.userId).role === "admin",
    });
});

router.get("/setting", async function (ctx, next) {
    if (connector.getUser(ctx.session.userId).role !== "admin") {
        ctx.response.redirect("/albums");
    } else {
        ctx.body = await ctx.renderView("setting", {
            role: connector.getUser(ctx.session.userId).role === "admin",
            users: connector.getUsers()
        });
    }
});

router.delete("/setting/reset/:ops", async function (ctx, next) {
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
});

router.post("/setting/user", async function (ctx, next) {
    if (connector.getUser(ctx.session.userId).role !== "admin") {
        ctx.response.redirect("/albums");
    } else {
        const body = ctx.request.body;
        connector.addUser(body.username, body.hash, body.role);
        ctx.status = 200;
    }
});

router.put("/setting/user", async function (ctx, next) {
    if (connector.getUser(ctx.session.userId).role !== "admin") {
        ctx.response.redirect("/albums");
    } else {
        const body = ctx.request.body;
        connector.changeRole(body.userid, body.username, body.role);
        ctx.status = 200;
    }
});

router.delete("/setting/user", async function (ctx, next) {
    if (connector.getUser(ctx.session.userId).role !== "admin") {
        ctx.response.redirect("/albums");
    } else {
        const body = ctx.request.body;
        connector.deleteUser(body.userid, body.username, body.role);
        ctx.status = 200;
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(Range);
app.use(Serve(__dirname + '/static'));

app.ws.use(Route.all('/setting/load', async function (ctx) {
    if (connector.getUser(ctx.session.userId).role === "admin") {
        await loader.loadAllMusic(`${__dirname}/static/music`, function (process, progress, process_file, progress_file) {
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

app.listen(3000);

console.log("listening port: 3000");