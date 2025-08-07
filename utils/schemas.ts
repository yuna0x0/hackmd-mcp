import { z } from "zod";

// Local type definitions to match HackMD API types
enum NotePermissionRole {
  OWNER = "owner",
  SIGNED_IN = "signed_in",
  GUEST = "guest",
}

enum CommentPermissionType {
  DISABLED = "disabled",
  FORBIDDEN = "forbidden",
  OWNERS = "owners",
  SIGNED_IN_USERS = "signed_in_users",
  EVERYONE = "everyone",
}

export const CreateNoteOptionsSchema = z.object({
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
});

export const UpdateNoteOptionsSchema = z.object({
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
});
