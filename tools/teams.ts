import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { API } from "@hackmd/api";

export function registerTeamsApiTools(server: McpServer, client: API) {
  // Tool: List teams
  server.tool(
    "list_teams",
    "List all teams accessible to the user",
    {},
    {
      title: "Get a list of the teams to which the user has permission",
      readOnlyHint: true,
      openWorldHint: true,
    },
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
