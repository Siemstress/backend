import "reflect-metadata";
import {Server} from "./src/server";

// Create server and enter OOP environment
async function main() {
    let server = new Server();
    await server.init();
}

main().catch(console.error);
