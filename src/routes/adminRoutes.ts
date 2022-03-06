import {Express} from "express";
import {User} from "../entities/User";
import {Utils} from "../utils";
import {Agent} from "../entities/Agent";

export class AdminRoutes {
    static async register(app: Express) {

        app.post('/api/adminCreateUser', async (req, res) => {
            let salt = Utils.randomCharacters(12);

            let user = await User.create({
                username: req.body.username,
                isAdmin: Utils.isTrue(req.body.isAdmin),
                salt: salt,
                hash: Utils.generateHash(req.body.password, salt),
                jobTitle: req.body.jobTitle,
                fullName: req.body.fullName
            }).save();

            res.send({success: 1, id: user.id});
        });

        app.delete('/api/adminDeleteUser/:id', async (req, res) => {
            await User.delete({id: parseInt(req.params.id)});
            res.send({success: 1});
        });

        app.delete('/api/adminDeleteAgent/:id', async (req, res) => {
            await Agent.delete({id: parseInt(req.params.id)});
            res.send({success: 1});
        })

    }
}
