import {Express} from "express";
import {User} from "../entities/User";
import {Utils} from "../utils";

export class DummyRoutes {
    static async register(app: Express) {

        app.use('/api/dummy', async (req, res) => {
            let salt = Utils.randomCharacters(16);

            await User.create({username: "admin", isAdmin: true, fullName: "Administrator", jobTitle: "System Administrator", salt: salt, hash: Utils.generateHash("redjuice", salt)}).save();

            res.send({success: 1});
        });

    }
}
