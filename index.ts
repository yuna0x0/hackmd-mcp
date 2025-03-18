#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get API token from environment
const API_TOKEN = process.env.HACKMD_API_TOKEN;
if (!API_TOKEN) {
  console.error("Error: HACKMD_API_TOKEN is required");
  process.exit(1);
}

const API_BASE_URL = "https://api.hackmd.io/v1";

// Create an MCP server for HackMD API
const server = new McpServer({
  name: "hackmd-mcp",
  version: "1.0.5",
});

// Utility function to make authenticated API requests
async function makeRequest(endpoint: string, options: any = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

// Tool: Get user information
server.tool("get_user_info", {}, async () => {
  try {
    const userInfo = await makeRequest("/me");
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
});

// Tool: List user's notes
server.tool("list_user_notes", {}, async () => {
  try {
    const notes = await makeRequest("/notes");
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(notes, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Tool: Get note by ID
server.tool(
  "get_note",
  {
    noteId: z.string().describe("Note ID"),
  },
  async ({ noteId }) => {
    try {
      const note = await makeRequest(`/notes/${noteId}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(note, null, 2),
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

// Tool: Create a new note
server.tool(
  "create_note",
  {
    title: z.string().describe("Note title"),
    content: z.string().describe("Note content"),
    readPermission: z
      .enum(["owner", "signed_in", "guest"])
      .default("owner")
      .describe("Read permission"),
    writePermission: z
      .enum(["owner", "signed_in", "guest"])
      .default("owner")
      .describe("Write permission"),
  },
  async ({ title, content, readPermission, writePermission }) => {
    try {
      // If content doesn't start with a title and title is provided, add it
      let finalContent = content;
      if (title && !content.startsWith("# ")) {
        finalContent = `# ${title}\n\n${content}`;
      }

      const note = await makeRequest("/notes", {
        method: "POST",
        body: JSON.stringify({
          title,
          content: finalContent,
          readPermission,
          writePermission,
        }),
      });

      return {
        content: [
          {
            type: "text",
            text: `Note created successfully:\n${JSON.stringify(note, null, 2)}`,
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

// Tool: Update a note
server.tool(
  "update_note",
  {
    noteId: z.string().describe("Note ID"),
    content: z.string().optional().describe("New note content"),
    readPermission: z
      .enum(["owner", "signed_in", "guest"])
      .optional()
      .describe("Read permission"),
    writePermission: z
      .enum(["owner", "signed_in", "guest"])
      .optional()
      .describe("Write permission"),
    permalink: z.string().optional().describe("Custom permalink"),
  },
  async ({ noteId, content, readPermission, writePermission, permalink }) => {
    try {
      const updateData: any = {};
      if (content !== undefined) updateData.content = content;
      if (readPermission !== undefined)
        updateData.readPermission = readPermission;
      if (writePermission !== undefined)
        updateData.writePermission = writePermission;
      if (permalink !== undefined) updateData.permalink = permalink;

      await makeRequest(`/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      return {
        content: [
          {
            type: "text",
            text: `Note ${noteId} updated successfully`,
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

// Tool: Delete a note
server.tool(
  "delete_note",
  {
    noteId: z.string().describe("Note ID"),
  },
  async ({ noteId }) => {
    try {
      await makeRequest(`/notes/${noteId}`, {
        method: "DELETE",
      });

      return {
        content: [
          {
            type: "text",
            text: `Note ${noteId} deleted successfully`,
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

// Tool: Get user's read history
server.tool("get_history", {}, async () => {
  try {
    const history = await makeRequest("/history");
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
});

// Tool: List teams
server.tool("list_teams", {}, async () => {
  try {
    const teams = await makeRequest("/teams");
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
});

// Tool: List team notes
server.tool(
  "list_team_notes",
  {
    teamPath: z.string().describe("Team path"),
  },
  async ({ teamPath }) => {
    try {
      const notes = await makeRequest(`/teams/${teamPath}/notes`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(notes, null, 2),
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

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
