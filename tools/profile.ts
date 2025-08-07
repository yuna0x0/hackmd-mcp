import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { API } from "@hackmd/api";

export function registerProfileApiTools(server: McpServer, client: API) {
  // Tool: Get user information
  server.tool(
    "get_user_info",
    "Get information about the authenticated user",
    {},
    {
      title: "Get user information",
      readOnlyHint: true,
      openWorldHint: true,
    },
    async () => {
      try {
        const userInfo = await client.getMe();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(userInfo, null, 2),
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
