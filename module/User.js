/**
 * Created by syuchan on 2017/03/17.
 */
import Util from "./Util";

class User {
    static createStorePassword(username, password) {
        const salt = Util.getSHA256(username);
        let hash = "";
        for (let i = 0; i < 10000; i++) {
            hash = Util.getSHA256(hash + salt + password);
        }
        return hash;
    }
}

export default User;