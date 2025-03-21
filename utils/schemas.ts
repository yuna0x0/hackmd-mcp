import { z } from "zod";
import {
  NotePermissionRole,
  CommentPermissionType,
} from "@hackmd/api/dist/type.js";

export const CreateNoteOptionsSchema = {
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

export const UpdateNoteOptionsSchema = {
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
