/**
 * Created by syuchan on 2017/03/23.
 */
import Path from "path";
import FFMPEG from "fluent-ffmpeg";
import Util from "./Util";

let ffmpeg = FFMPEG();

class MusicLoader {
    constructor(binPath, connector) {
        if (binPath) {
            ffmpeg.setFfmpegPath(binPath + "/ffmpeg.exe");
            ffmpeg.setFfprobePath(binPath + "/ffprobe.exe");
        }
        this.connector = connector;
    }

    loadAllMusic(musicDir, wsSend) {
        const connector = this.connector;
        const convertMusic = this.convertMusic;
        const createThumbnail = this.createThumbnail;
        const getMetadata = this.getMetadata;
        return new Promise(async function (resolve, reject) {
            Util.getFilesRecursive(musicDir, async function (err, files) {
                const fpp = 100.0 / files.length;
                for (let i = 0; i < files.length; i++) {
                    const path = files[i];
                    const f = Path.relative(musicDir, path);
                    wsSend("GetMeta", fpp * i + fpp * 0.1, f, 10);
                    const format = (await getMetadata(path)).format;
                    const meta = Object.assign({
                        album_artist: undefined,
                        artist: "unknown",
                        album: "unknown",
                        genre: "unknown",
                        track: "0/0",
                        title: Util.getFileName(f),
                    }, format.tags);
                    if (meta.track.split("/").length === 1) meta.track += "/0";
                    if (!meta.album_artist) {
                        if (meta.hasOwnProperty("compilation")) {
                            meta.album_artist = "Various Artists";
                        } else {
                            meta.album_artist = meta.artist;
                        }
                    }
                    let outPath;
                    wsSend("Convert", fpp * i + fpp * 0.2, f, 20);
                    if (Path.extname(path) === ".mp3") {
                        outPath = `/music/${f}`;
                    } else {
                        outPath = `/cache/${await convertMusic(path, function (progress) {
                            if (progress.percent !== undefined) {
                                let convProg = 20 + 19 * (progress.percent / 100);
                                wsSend("Convert", fpp * i + fpp * (convProg / 100), f, convProg);
                            }
                        })}`;
                    }
                    wsSend("AddAlbum", fpp * i + fpp * 0.4, f, 40);
                    const albumId = connector.addAlbum(meta.album, meta.album_artist, meta.genre, meta.track.split("/")[1]);
                    wsSend("CreateThumbnail", fpp * i + fpp * 0.6, f, 60);
                    await createThumbnail(path, `${__dirname}/../static/thumbnail/${meta.album}_${albumId}.png`);
                    wsSend("AddSong", fpp * i + fpp * 0.8, f, 80);
                    connector.addSong(meta.title, albumId, meta.track.split("/")[0], meta.artist,
                        Math.floor(format.duration * 1000), `/music/${f}`, outPath);
                    wsSend("Complete", fpp * i + fpp, f, 100);
                }
            });
        });
    }

    convertMusic(srcPath, progressFunc) {
        return new Promise(function (resolve, reject) {
            const output = __dirname + "./../static/cache/" + Util.getSHA256(srcPath) + ".mp3";
            const f = ffmpeg.clone()
                .noVideo()
                .input(srcPath)
                .on("error", function (err, stdout, stderr) {
                    reject(err);
                })
                .on('end', function () {
                    resolve(Path.basename(output));
                });
            if (progressFunc) f.on('progress', progressFunc);
            f.save(output);
        });
    }

    createThumbnail(srcPath, outPath) {
        return new Promise(function (resolve, reject) {
            ffmpeg.clone()
                .noAudio()
                .input(srcPath)
                .on("error", function (err, stdout, stderr) {
                    reject(err);
                })
                .on('end', function () {
                    resolve(outPath);
                })
                .save(outPath);
        });
    }

    getMetadata(srcPath) {
        return new Promise(function (resolve, reject) {
            ffmpeg.clone()
                .input(srcPath)
                .ffprobe(function (err, metadata) {
                    if (err) reject(err);
                    resolve(metadata);
                });
        });
    }

    static clearCache() {
        Util.rmDirInFile(__dirname + "./../static/cache");
    }

    static clearThumbnail() {
        Util.rmDirInFile(__dirname + "./../static/thumbnail");
    }
}

export default MusicLoader;