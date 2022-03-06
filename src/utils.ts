// General Utilities
import {pbkdf2Sync} from "crypto";
import {Agent} from "./entities/Agent";
import {Stat} from "./entities/Stat";

export class Utils {
    static async generalUtil() {
        console.log("This is the general util function");
    }

    static generateHash(password: string, salt: string): string {
        return pbkdf2Sync(password, salt, 2048, 64, 'sha256').toString();
    }

    // Shamelessly stolen from https://stackoverflow.com/a/1349426
    static randomCharacters(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    static sendError(res: any, message: string, statusCode = 403): void {
        res.status(statusCode);
        res.send({success: 0, message: message});
    }

    static async generateStatus(agent: Agent): Promise<{ lastUpdated: Date, cpu: number, memory: number, netIn: number, netOut: number, disk: number } | null> {
        let statuses = await Stat.find({where: {agent: agent}, order: {id: "DESC"}, take: 2});
        if (statuses.length < 2) {
            return null;
        }

        return {
            lastUpdated: statuses[1].date,
            cpu: statuses[1].cpu,
            memory: statuses[1].memory,
            netIn: statuses[0].netIn - statuses[1].netIn,
            netOut: statuses[0].netOut - statuses[1].netOut,
            disk: statuses[1].disk
        };
    }

    static async getAgentByCredentials(agentId: string, agentKey: string): Promise<Agent | null> {
        let agent = await Agent.findOne(agentId);
        if (!agent) {
            return null;
        }
        if (agent.key == agentKey) {
            return agent;
        }
        return null;
    }

    static isTrue(given: any): boolean {
        return given == "true" || given == 1 || given == true;
    }
}
