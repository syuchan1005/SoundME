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
}

export default Util;