import {Express} from "express";

export class AdminRoutes {
    static async register(app: Express) {

        app.post('/api/adminCreateUser', async (req, res) => {

        });

        app.delete('/api/adminDeleteUser', async (req, res) => {

        });

        app.delete('/api/adminDeleteAgent', async (req, res) => {

        })

    }
}
