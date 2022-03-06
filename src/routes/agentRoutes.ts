import {Express} from "express";
import {Utils} from "../utils";
import {Stat} from "../entities/Stat";
import * as fs from "fs";
import * as path from "path";
import {Globals} from "../globals";

export class AgentRoutes {
    static async register(app: Express) {

        app.post('/api/agentUpdate/:id/:key', async (req, res) => {
            let agent = await Utils.getAgentByCredentials(req.params.id, req.params.key)
            if (!agent) {
                Utils.sendError(res, "Invalid Agent Credentials", 403);
                return;
            }

            let cpu = req.body.cpu;
            let memory = req.body.memory;
            let netIn = req.body.netIn;
            let netOut = req.body.netOut;
            let disk = req.body.disk;

            let stat = Stat.create({
                agent: agent,
                date: new Date(),
                cpu: cpu,
                memory: memory,
                netIn: netIn,
                netOut: netOut,
                disk: disk
            }).save();

            agent.lastUpdated = new Date();
            await agent.save();

            res.send({
                success: 1,
                action: ""
            });
        });

        app.post('/api/agentRegister/:id/:key', async (req, res) => {

            let agent = await Utils.getAgentByCredentials(req.params.id, req.params.key)
            if (!agent) {
                Utils.sendError(res, "Invalid Agent Credentials", 403);
                return;
            }

            agent.hostname = req.body.hostname ? req.body.hostname : agent.hostname;
            agent.operatingSystem = req.body.operatingSystem ? req.body.operatingSystem : agent.operatingSystem;
            agent.kernel = req.body.kernel ? req.body.kernel : agent.kernel;
            agent.externalIp = req.socket.remoteAddress;
            agent.lastRegistered = new Date();
            await agent.save();

            res.send({
                success: 1
            });
        });

        app.get('/api/agentInstall/:id/:key', async (req, res) => {
            let agent = await Utils.getAgentByCredentials(req.params.id, req.params.key)
            if (!agent) {
                Utils.sendError(res, "Invalid Agent Credentials", 403);
                return;
            }

            let installAgent = fs.readFileSync(path.join(Globals.srcDir, "assets/installAgent.sh")).toString();
            installAgent = installAgent.replaceAll("%%HOSTNAME%%", Globals.hostname);
            installAgent = installAgent.replaceAll("%%AGENTID%%", `${agent.id}`);
            installAgent = installAgent.replaceAll("%%AGENT_KEY%%", agent.key);
            installAgent = installAgent.replaceAll("\r\n", "\n");

            res.send(installAgent);
        });

        app.get('/api/agentPython/:id/:key', async (req, res) => {
            let agent = await Utils.getAgentByCredentials(req.params.id, req.params.key)
            if (!agent) {
                Utils.sendError(res, "Invalid Agent Credentials", 403);
                return;
            }

            let pythonAgent = fs.readFileSync(path.join(Globals.srcDir, "assets/pythonAgent.py")).toString();
            pythonAgent = pythonAgent.replaceAll("%%HOSTNAME%%", Globals.hostname);
            pythonAgent = pythonAgent.replaceAll("%%AGENTID%%", `${agent.id}`);
            pythonAgent = pythonAgent.replaceAll("%%AGENT_KEY%%", agent.key);

            res.send(pythonAgent);
        });

        app.get('/api/agentActionSsh/:id/:key', async (req, res) => {
            let agent = await Utils.getAgentByCredentials(req.params.id, req.params.key)
            if (!agent) {
                Utils.sendError(res, "Invalid Agent Credentials", 403);
                return;
            }

            res.send({
                success: 1
            });
        });


    }
}
