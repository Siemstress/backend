// General Utilities
import {pbkdf2, pbkdf2Sync} from "crypto";

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

    static sendError(res: any, message: string, statusCode=403): void {
        res.status(statusCode);
        res.send({success: 0, message: message});
    }
}
