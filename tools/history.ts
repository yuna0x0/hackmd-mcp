import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { API } from "@hackmd/api";

export function registerHistoryApiTools(server: McpServer, client: API) {
  // Tool: Get user's read history
  server.tool(
    "get_history",
    "Get user's reading history",
    {},
    {
      title: "Get a history of read notes",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async () => {
      try {
        const history = await client.getHistory();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(history, null, 2),
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
