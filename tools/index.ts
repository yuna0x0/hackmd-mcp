export { registerProfileApiTools } from "./profile.js";
export { registerTeamsApiTools } from "./teams.js";
export { registerHistoryApiTools } from "./history.js";
export { registerTeamNotesApiTools } from "./teamNotes.js";
export { registerUserNotesApiTools } from "./userNotes.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { API } from "@hackmd/api";
import { registerProfileApiTools } from "./profile.js";
import { registerTeamsApiTools } from "./teams.js";
import { registerHistoryApiTools } from "./history.js";
import { registerTeamNotesApiTools } from "./teamNotes.js";
import { registerUserNotesApiTools } from "./userNotes.js";

export function registerAllTools(server: McpServer, client: API) {
  registerProfileApiTools(server, client);
  registerTeamsApiTools(server, client);
  registerHistoryApiTools(server, client);
  registerTeamNotesApiTools(server, client);
  registerUserNotesApiTools(server, client);
}
