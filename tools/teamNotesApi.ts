import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import HackMDAPI from "@hackmd/api";
import { z } from "zod";
import {
  CreateNoteOptionsSchema,
  UpdateNoteOptionsSchema,
} from "../utils/schemas.js";

export function registerTeamNotesApiTools(
  server: McpServer,
  client: HackMDAPI.API,
) {
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
    async ({ teamPath, ...payload }) => {
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
      ...UpdateNoteOptionsSchema,
    },
    async ({ teamPath, noteId, ...options }) => {
      try {
        await client.updateTeamNote(teamPath, noteId, options);
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
}
