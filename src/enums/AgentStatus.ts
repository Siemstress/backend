export enum AgentStatus {
    CREATED = "CREATED", // A user has created this agent in the dashboard
    RETRIEVED = "RETRIEVED", // The install script was been retrieved
    REGISTERED = "REGISTERED", // The agent install script registered with the server
    DOWNLOADED = "DOWNLOADED", // The agent install script downloaded the python script
    OPERATIONAL = "OPERATIONAL" // The agent is running and is actively polling the server
}
