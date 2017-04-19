/**
 * Created by syuchan on 2017/03/23.
 */
import fs from "fs";
import Path from "path";
import crypto from "crypto";
import debug from "debug";

const write = debug("soundme");

class Util {
    static getSHA256(str) {
        return crypto.createHash("sha256").update(str).digest('hex');
    }

    static putThumbnailData(v) {
        if (Array.isArray(v)) {
            v.forEach((album) => {
                album.thumbnail = Util.getSHA256(`${album.name}_${album.id}`);
            });
        } else {
            v.thumbnail = Util.getSHA256(`${v.name}_${v.id}`);
        }
        return v;
    }

    static rmDirInFile(dirPath) {
        fs.readdir(dirPath, function (err, files) {
            if (!err) {
                files.forEach(function (f) {
                    fs.unlinkSync(`${dirPath}/${f}`);
                });
            } else {
                write(err);
            }
        });
    }

    static getFileName(path) {
        return Path.basename(path, Path.extname(path));
    }

    static getFilesRecursive(path, callback) {
        let list = [];
        fs.readdir(path, function (err, files) {
            if (err) {
                return callback(err)
            }
            let pending = files.length;
            if (!pending) {
                return callback(null, list)
            }
            files.forEach(function (file) {
                const filePath = Path.join(path, file);
                fs.stat(filePath, function (_err, stats) {
                    if (_err) {
                        return callback(_err)
                    }
                    if (stats.isDirectory()) {
                        Util.getFilesRecursive(filePath, function (__err, res) {
                            if (__err) {
                                return callback(__err)
                            }

                            list = list.concat(res);
                            pending -= 1;
                            if (!pending) {
                                return callback(null, list)
                            }
                        })
                    } else {
                        list.push(filePath);
                        pending -= 1;
                        if (!pending) {
                            return callback(null, list)
                        }
                    }

                })
            })
        })
    }

    static katakanaToHiragana(src) {
        return src.replace(/[\u30a1-\u30f6]/g, function (match) {
            var chr = match.charCodeAt(0) - 0x60;
            return String.fromCharCode(chr);
        });
    }
}

export default Util;