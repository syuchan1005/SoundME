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

    static rmDirInFile(dirPath) {
        fs.readdir(dirPath, function (err, files) {
            if (!err) {
                files.forEach(function (f) {
                    try {
                        fs.unlinkSync(`${dirPath}/${f}`);
                    } catch (e) {
                        write(e);
                    }
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
            return String.fromCharCode(match.charCodeAt(0) - 0x60);
        });
    }

    static normalizePath(str, stripTrailing) {
        str = str.replace(/[\\\/]+/g, '/');
        if (stripTrailing !== false) {
            str = Util.removeTrailingSeparator(str);
        }
        return str;
    }

    static removeTrailingSeparator(str) {
        while (Util.endsInSeparator(str)) {
            str = str.slice(0, -1);
        }
        return str;
    }

    static endsInSeparator(str) {
        const last = str[str.length - 1];
        return str.length > 1 && (last === '/' || (process.platform === 'win32' && last === '\\'));
    }

    static createStorePassword(username, password) {
        const salt = Util.getSHA256(username);
        let hash = "";
        for (let i = 0; i < 10000; i++) {
            hash = Util.getSHA256(hash + salt + password);
        }
        return hash;
    }

    static createRandomString(length) {
        const c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let r = "";
        for (let i = 0; i < length; i++) {
            r += c[Math.floor(Math.random() * c.length)];
        }
        return r;
    }

    static hasPerm(song, role) {
        const perm = JSON.parse(song.perm); // song.perm = ["role", "test"]
        if (perm.includes("*") || role === "admin") return true;
        return perm.includes(role);
    }
}

export default Util;