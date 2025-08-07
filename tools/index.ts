export { registerProfileApiTools } from "./profile.js";
export { registerTeamsApiTools } from "./teamsApi.js";
export { registerHistoryApiTools } from "./history.js";
export { registerTeamNotesApiTools } from "./teamNotesApi.js";
export { registerUserNotesApiTools } from "./userNotesApi.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { API } from "@hackmd/api";
import { registerProfileApiTools } from "./profile.js";
import { registerTeamsApiTools } from "./teamsApi.js";
import { registerHistoryApiTools } from "./history.js";
import { registerTeamNotesApiTools } from "./teamNotesApi.js";
import { registerUserNotesApiTools } from "./userNotesApi.js";

export function registerAllTools(server: McpServer, client: API) {
  registerProfileApiTools(server, client);
  registerTeamsApiTools(server, client);
  registerHistoryApiTools(server, client);
  registerTeamNotesApiTools(server, client);
  registerUserNotesApiTools(server, client);
}
