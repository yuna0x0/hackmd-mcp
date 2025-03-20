import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import HackMDAPI from "@hackmd/api";
import {
  SingleNote,
  NotePermissionRole,
  CommentPermissionType,
  CreateNoteOptions,
} from "@hackmd/api/dist/type.js";

// Load environment variables
dotenv.config();

// Get API token from environment
const API_TOKEN = process.env.HACKMD_API_TOKEN;
if (!API_TOKEN) {
  console.error("Error: HACKMD_API_TOKEN is required");
  process.exit(1);
}
const API_URL = process.env.HACKMD_API_URL;

const CreateNoteOptionsSchema = {
  title: z.string().optional().describe("Note title"),
  content: z.string().optional().describe("Note content"),
  readPermission: z
    .enum([
      NotePermissionRole.OWNER,
      NotePermissionRole.SIGNED_IN,
      NotePermissionRole.GUEST,
    ])
    .optional()
    .describe("Read permission"),
  writePermission: z
    .enum([
      NotePermissionRole.OWNER,
      NotePermissionRole.SIGNED_IN,
      NotePermissionRole.GUEST,
    ])
    .optional()
    .describe("Write permission"),
  commentPermission: z
    .enum([
      CommentPermissionType.DISABLED,
      CommentPermissionType.FORBIDDEN,
      CommentPermissionType.OWNERS,
      CommentPermissionType.SIGNED_IN_USERS,
      CommentPermissionType.EVERYONE,
    ])
    .optional()
    .describe("Comment permission"),
  permalink: z.string().optional().describe("Custom permalink"),
};

const UpdateNoteOptionsSchema = {
  content: z.string().optional().describe("New note content"),
  readPermission: z
    .enum([
      NotePermissionRole.OWNER,
      NotePermissionRole.SIGNED_IN,
      NotePermissionRole.GUEST,
    ])
    .optional()
    .describe("Read permission"),
  writePermission: z
    .enum([
      NotePermissionRole.OWNER,
      NotePermissionRole.SIGNED_IN,
      NotePermissionRole.GUEST,
    ])
    .optional()
    .describe("Write permission"),
  permalink: z.string().optional().describe("Custom permalink"),
};

// Initialize HackMD API client
const client = new HackMDAPI.API(API_TOKEN, API_URL);

// Create an MCP server for HackMD API
const server = new McpServer({
  name: "hackmd-mcp",
  version: "1.1.1",
});

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

// Tool: List user's notes
server.tool(
  "list_user_notes",
  "List all notes owned by the user",
  {},
  async () => {
    try {
      const notes = await client.getNoteList();
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

// Tool: Get note by ID
server.tool(
  "get_note",
  "Get a note by its ID",
  {
    noteId: z.string().describe("Note ID"),
  },
  async ({ noteId }) => {
    try {
      const note = await client.getNote(noteId);
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
  "Create a new note",
  CreateNoteOptionsSchema,
  async ({
    title,
    content,
    readPermission,
    writePermission,
    commentPermission,
    permalink,
  }) => {
    try {
      const payload: CreateNoteOptions = {
        title,
        content,
        readPermission,
        writePermission,
        commentPermission,
        permalink,
      };

      const note = await client.createNote(payload);

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
  "Update an existing note",
  {
    noteId: z.string().describe("Note ID"),
    ...UpdateNoteOptionsSchema,
  },
  async ({ noteId, content, readPermission, writePermission, permalink }) => {
    try {
      const updateData: Partial<
        Pick<
          SingleNote,
          "content" | "readPermission" | "writePermission" | "permalink"
        >
      > = {
        content,
        readPermission,
        writePermission,
        permalink,
      };

      await client.updateNote(noteId, updateData);

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
  "Delete a note",
  {
    noteId: z.string().describe("Note ID"),
  },
  async ({ noteId }) => {
    try {
      await client.deleteNote(noteId);

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
server.tool("get_history", "Get user's reading history", {}, async () => {
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
});

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

// Tool: List team notes
server.tool(
  "list_team_notes",
  "List all notes in a team",
  {
    teamPath: z.string().describe("Team path"),
  },
  async ({ teamPath }) => {
    try {
      const notes = await client.getTeamNotes(teamPath);
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

// Tool: Create a team note
server.tool(
  "create_team_note",
  "Create a new note in a team",
  {
    teamPath: z.string().describe("Team path"),
    ...CreateNoteOptionsSchema,
  },
  async ({
    teamPath,
    title,
    content,
    readPermission,
    writePermission,
    commentPermission,
    permalink,
  }) => {
    try {
      const payload: CreateNoteOptions = {
        title,
        content,
        readPermission,
        writePermission,
        commentPermission,
        permalink,
      };

      const note = await client.createTeamNote(teamPath, payload);

      return {
        content: [
          {
            type: "text",
            text: `Team note created successfully:\n${JSON.stringify(note, null, 2)}`,
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

// Tool: Update a team note
server.tool(
  "update_team_note",
  "Update an existing note in a team",
  {
    teamPath: z.string().describe("Team path"),
    noteId: z.string().describe("Note ID"),
    ...UpdateNoteOptionsSchema,
  },
  async ({
    teamPath,
    noteId,
    content,
    readPermission,
    writePermission,
    permalink,
  }) => {
    try {
      const updateData: Partial<
        Pick<
          SingleNote,
          "content" | "readPermission" | "writePermission" | "permalink"
        >
      > = {
        content,
        readPermission,
        writePermission,
        permalink,
      };

      await client.updateTeamNote(teamPath, noteId, updateData);

      return {
        content: [
          {
            type: "text",
            text: `Team note ${noteId} updated successfully`,
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

// Tool: Delete a team note
server.tool(
  "delete_team_note",
  "Delete a note in a team",
  {
    teamPath: z.string().describe("Team path"),
    noteId: z.string().describe("Note ID"),
  },
  async ({ teamPath, noteId }) => {
    try {
      await client.deleteTeamNote(teamPath, noteId);

      return {
        content: [
          {
            type: "text",
            text: `Team note ${noteId} deleted successfully`,
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
