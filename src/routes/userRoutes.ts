import {Express} from "express";
import {Agent} from "../entities/Agent";
import {Utils} from "../utils";
import {AgentStatus} from "../enums/AgentStatus";
import {Globals} from "../globals";
import {CallbackManager} from "../callbackManager";
import * as geoip from "geoip-lite";

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
            let agents = await Agent.find();

            for (let agent of agents) {
                agent.key = undefined;
                agent["lastStatus"] = await Utils.generateStatus(agent);
            }

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
            let agent = await Agent.create({
                agentStatus: AgentStatus.CREATED,
                key: Utils.randomCharacters(12),
                dateAdded: new Date()
            }).save();
            res.send({
                success: 1,
                installCommand: `curl ${Globals.hostname}/api/agentInstall/${agent.id}/${agent.key} | bash`
            });
        });

        app.post('/api/executeAction/:id/:action', async (req, res) => {
            let agent = await Agent.findOne(req.params.id);
            if (!agent) {
                Utils.sendError(res, "Agent doesn't exist", 400);
                return;
            }

            CallbackManager.registerCallback(`ssh_${agent.id}`, (data) => {
                let countries = {};
                let ips = JSON.parse(data.ip.replaceAll("'", "\""));
                let users = JSON.parse(data.user.replaceAll("'", "\""));
                let totalRequests = 0;

                Object.keys(ips).forEach(ip => {
                    let count = ips[ip];
                    let result = geoip.lookup(ip);
                    if (result?.country) {
                        countries[result.country] = count + (countries[result.country] ? countries[result.country] : 0);
                    }
                    totalRequests += count;
                });

                res.send({
                    success: 1,
                    countries,
                    users,
                    totalRequests
                });
            });

            agent.agentAction = req.params.action;
            await agent.save();
        });

    }
}
