export { registerUserApiTools } from "./userApi.js";
export { registerUserNotesApiTools } from "./userNotesApi.js";
export { registerTeamsApiTools } from "./teamsApi.js";
export { registerTeamNotesApiTools } from "./teamNotesApi.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import HackMDAPI from "@hackmd/api";
import { registerUserApiTools } from "./userApi.js";
import { registerUserNotesApiTools } from "./userNotesApi.js";
import { registerTeamsApiTools } from "./teamsApi.js";
import { registerTeamNotesApiTools } from "./teamNotesApi.js";

export function registerAllTools(server: McpServer, client: HackMDAPI.API) {
  registerUserApiTools(server, client);
  registerUserNotesApiTools(server, client);
  registerTeamsApiTools(server, client);
  registerTeamNotesApiTools(server, client);
}
