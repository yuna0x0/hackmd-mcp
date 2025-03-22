import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type HackMDAPI from "@hackmd/api";

export function registerUserApiTools(server: McpServer, client: HackMDAPI.API) {
  // Tool: Get user information
  server.tool(
    "get_user_info",
    "Get information about the authenticated user",
    {},
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
