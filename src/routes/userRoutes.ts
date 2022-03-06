import {Express} from "express";
import {Agent} from "../entities/Agent";
import {Utils} from "../utils";
import {AgentStatus} from "../enums/AgentStatus";
import {Globals} from "../globals";

export class UserRoutes {
    static async register(app: Express) {

        app.get('/api/whoami', async (req, res) => {
            res.send({
                success: 1,
                user: {
                    id: req.user.id,
                    username: req.user.username,
                    fullName: req.user.fullName,
                    jobTitle: req.user.jobTitle,
                    isAdmin: req.user.isAdmin
                }
            });
        });

        app.get('/api/getAgents', async (req, res) => {
            let agents = (await Agent.find()).map(agent => agent.id);
            res.send({
                success: 1,
                agents: agents
            });
        });

        app.get('/api/getAgent/:id', async (req, res) => {
            let agent = await Agent.findOne(req.params.id);
            if (!agent) {
                Utils.sendError(res, "No agent found with that id", 404);
                return;
            }

            agent.key = undefined;
            let status = await Utils.generateStatus(agent);

            res.send({
                success: 1,
                agent: agent,
                lastStatus: status,
            });
        });

        app.post('/api/createAgent', async (req, res) => {
            let agent = await Agent.create({agentStatus: AgentStatus.CREATED, key: Utils.randomCharacters(12), dateAdded: new Date()}).save();
            res.send({
                success: 1,
                installCommand: `${Globals.hostname}/api/installAgent/${agent.id}/${agent.key}`
            });
        });

    }
}
