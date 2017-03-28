/**
 * Created by syuchan on 2017/03/23.
 */
import fs from "fs";
import crypto from "crypto";

class Util {
    static getSHA256(str) {
        return crypto.createHash("sha256").update(str).digest('hex');
    }

    static rmDirInFile(dirPath) {
        fs.readdir(dirPath, function (err, files) {
           files.forEach(function (f) {
               fs.unlink(`${dirPath}/${f}`);
           });
        });
    }
}

export default Util;