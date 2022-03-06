import {Express} from "express";
import {Utils} from "../utils";
import * as jwt from "jsonwebtoken";
import {User} from "../entities/User";

export class AuthenticationHandler {
    static async register(app: Express) {
        const jwtSecret = process.env.SECRET || "#zXJj%HeA5sw$a";

        app.post('/api/login', async (req, res) => {
            let username = req.body['username'];
            let password = req.body['password'];

            if (!username || !password) {
                Utils.sendError(res, "Username or Password not sent");
                return;
            }

            let user = await User.findOne({where: {username: username}});
            if (!user) {
                Utils.sendError(res, "Username/Password combination invalid");
                return;
            }

            if (user.hash != Utils.generateHash(password, user.salt)) {
                Utils.sendError(res, "Username/Password combination invalid");
                return;
            }

            res.send({success: 1, token: jwt.sign({userId: user.id}, jwtSecret)});

        });

        app.use(async (req, res, next) => {
            if (req.path.startsWith("/api/agent")) {
                // Agents authenticate through id+key instead of token
                next();
                return;
            }

            let token = `${req.query['token']}`;

            if (token === "") {
                Utils.sendError(res, "Token not sent");
                return;
            }

            try {
                let payload = jwt.verify(token, jwtSecret) as any;
                req.user = await User.findOne(payload.userId);
            } catch (e) {
                Utils.sendError(res, "Invalid Token");
                return;
            }

            next();
        });

        app.use("/api/admin*", async (req, res, next) => {
            if (req.user.isAdmin) {
                next();
            } else {
                Utils.sendError(res, "Insufficient Permissions");
                return;
            }
        });
    }
}
