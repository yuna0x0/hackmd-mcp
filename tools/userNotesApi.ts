import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import HackMDAPI from "@hackmd/api";
import { z } from "zod";
import {
  CreateNoteOptionsSchema,
  UpdateNoteOptionsSchema,
} from "../utils/schemas.js";

export function registerUserNotesApiTools(
  server: McpServer,
  client: HackMDAPI.API,
) {
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
    async (payload) => {
      try {
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
    async ({ noteId, ...payload }) => {
      try {
        await client.updateNote(noteId, payload);
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
}
