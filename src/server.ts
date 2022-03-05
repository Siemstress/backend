import {Express} from "express";
import express = require("express");
import morgan from "morgan";
import {Connection, createConnection} from "typeorm";
import {User} from "./entities/User";
import {Agent} from "./entities/Agent";
import {Report} from "./entities/Report";
import {Stat} from "./entities/Stat";


export class Server {
    app: Express;
    connection: Connection;

    async init() {
        this.app = express();
        this.connection = await createConnection({
            type: 'sqlite',
            synchronize: true,
            database: "./db.sqlite",
            entities: [User, Stat, Report, Agent],
        });
        const port = process.env.PORT || 3000;

        this.app.use(morgan('dev'));

        this.app.listen(port, () => {
            console.log(`Siemstress Backend listening on port ${port}`);
        });
    }
}
