/**
 * Created by syuchan on 2017/03/23.
 */
import fs from "fs";
import Path from "path";
import crypto from "crypto";

class Util {
    static getSHA256(str) {
        return crypto.createHash("sha256").update(str).digest('hex');
    }

    static rmDirInFile(dirPath) {
        fs.readdir(dirPath, function (err, files) {
           files.forEach(function (f) {
               fs.unlinkSync(`${dirPath}/${f}`);
           });
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
}

export default Util;