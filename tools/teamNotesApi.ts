import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { API } from "@hackmd/api";
import { z } from "zod";
import {
  CreateNoteOptionsSchema,
  UpdateNoteOptionsSchema,
} from "../utils/schemas.js";

export function registerTeamNotesApiTools(server: McpServer, client: API) {
  // Tool: List team notes
  server.tool(
    "list_team_notes",
    "List all notes in a team",
    {
      teamPath: z.string().describe("Team path"),
    },
    {
      title: "Get a list of notes in a Team's workspace",
      readOnlyHint: true,
      openWorldHint: true,
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
      payload: CreateNoteOptionsSchema.describe("Create note options"),
    },
    {
      title: "Create a note in a Team workspace",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async ({ teamPath, payload }) => {
      try {
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
      options: UpdateNoteOptionsSchema.describe("Update note options"),
    },
    {
      title: "Update a note in a Team's workspace",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
    async ({ teamPath, noteId, options }) => {
      try {
        const result = await client.updateTeamNote(teamPath, noteId, options);
        return {
          content: [
            {
              type: "text",
              text: `Team note ${noteId} updated successfully:\n${JSON.stringify(result, null, 2)}`,
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
    {
      title: "Delete a note in a Team's workspace",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    async ({ teamPath, noteId }) => {
      try {
        const result = await client.deleteTeamNote(teamPath, noteId);
        return {
          content: [
            {
              type: "text",
              text: `Team note ${noteId} deleted successfully:\n${JSON.stringify(result, null, 2)}`,
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
