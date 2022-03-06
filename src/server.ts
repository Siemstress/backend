import {Express} from "express";
import express = require("express");
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import {Connection, createConnection} from "typeorm";
import {User} from "./entities/User";
import {Agent} from "./entities/Agent";
import {Report} from "./entities/Report";
import {Stat} from "./entities/Stat";
import {AuthenticationHandler} from "./middleware/authenticationHandler";
import {AdminRoutes} from "./routes/adminRoutes";
import {AgentRoutes} from "./routes/agentRoutes";
import {UserRoutes} from "./routes/userRoutes";
import {DummyRoutes} from "./routes/dummyRoutes";

export class Server {
    app: Express;
    connection: Connection;

    async init() {
        this.app = express();
        this.connection = await createConnection({
            type: 'sqlite',
            synchronize: true,
            logging: false,
            database: "./db.sqlite",
            entities: [User, Stat, Report, Agent],
        });
        const port = process.env.PORT || 3000;

        this.app.use(morgan('dev'));
        this.app.use(cors())
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded());

        await DummyRoutes.register(this.app);

        await AuthenticationHandler.register(this.app);
        await AdminRoutes.register(this.app);
        await AgentRoutes.register(this.app);
        await UserRoutes.register(this.app);

        this.app.listen(port, () => {
            console.log(`Siemstress Backend listening on port ${port}`);
        });
    }
}
