/**
 * Created by syuchan on 2017/03/16.
 */
import SQLiteImpl from "./DBImpl/SQLiteImpl";

class DBConnector {
    static createInstance(config) {
        switch (config.type.toLowerCase()) {
            case "sqlite":
                return new SQLiteImpl(config);
            default:
                throw new Error("Unknown SQLType :" + config.type);
        }
    }

    static singleQuoteEscape(data) {
        const str = data + "";
        return str.replace(/[\0\n\r\b\t\\'"\x1a]/g, function (s) {
            switch (s) {
                case "\0":
                    return "\\0";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\b":
                    return "\\b";
                case "\t":
                    return "\\t";
                case "\x1a":
                    return "\\Z";
                case "'":
                    return "''";
                case '"':
                    return '""';
                default:
                    return "\\" + s;
            }
        });
    }
}

export default DBConnector;