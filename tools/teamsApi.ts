import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import HackMDAPI from "@hackmd/api";

export function registerTeamsApiTools(
  server: McpServer,
  client: HackMDAPI.API,
) {
  // Tool: List teams
  server.tool(
    "list_teams",
    "List all teams accessible to the user",
    {},
    async () => {
      try {
        const teams = await client.getTeams();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(teams, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );
}
