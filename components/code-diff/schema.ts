import { z } from "zod";

export const serializableCodeDiffActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  tone: z.enum(["primary", "neutral", "danger"]).optional(),
  shortcut: z.string().optional(),
});

export const serializableCodeDiffHighlightRangeSchema = z.object({
  start: z.number().int().nonnegative(),
  length: z.number().int().nonnegative(),
  kind: z.enum(["add", "remove", "change"]).optional(),
});

export const serializableCodeDiffLineSchema = z.object({
  id: z.string(),
  kind: z.enum(["context", "add", "remove"]),
  lineNumber: z.number().int().positive().optional(),
  content: z.string(),
  highlightRanges: z
    .array(serializableCodeDiffHighlightRangeSchema)
    .optional(),
  meta: z.record(z.string(), z.string()).optional(),
  actions: z.array(serializableCodeDiffActionSchema).optional(),
});

export const serializableCodeDiffHunkSchema = z.object({
  id: z.string(),
  header: z.string().optional(),
  oldStartLine: z.number().int().positive().optional(),
  newStartLine: z.number().int().positive().optional(),
  summary: z.string().optional(),
  isCollapsed: z.boolean().optional(),
  lines: z.array(serializableCodeDiffLineSchema).default([]),
  actions: z.array(serializableCodeDiffActionSchema).optional(),
});

export const serializableCodeDiffFileSchema = z.object({
  id: z.string(),
  path: z.string(),
  oldPath: z.string().optional(),
  status: z.enum(["modified", "added", "deleted", "renamed"]),
  language: z.string().optional(),
  insertions: z.number().int().nonnegative().optional(),
  deletions: z.number().int().nonnegative().optional(),
  isCollapsed: z.boolean().optional(),
  hunks: z.array(serializableCodeDiffHunkSchema).default([]),
  actions: z.array(serializableCodeDiffActionSchema).optional(),
});

export const serializableCodeDiffReceiptSchema = z.object({
  kind: z.enum(["apply", "revert", "comment", "custom"]).optional(),
  status: z.enum(["success", "partial", "failed", "cancelled"]),
  summary: z.string(),
  createdAtISO: z.string(),
  fileIds: z.array(z.string()).optional(),
  hunkIds: z.array(z.string()).optional(),
});

export const serializableCodeDiffSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  meta: z
    .object({
      baseLabel: z.string().optional(),
      headLabel: z.string().optional(),
      baseCommit: z.string().optional(),
      headCommit: z.string().optional(),
      repository: z.string().optional(),
      isComplete: z.boolean().optional(),
    })
    .optional(),
  capturedAtISO: z.string().optional(),
  summary: z
    .object({
      filesChanged: z.number().int().nonnegative(),
      insertions: z.number().int().nonnegative(),
      deletions: z.number().int().nonnegative(),
    })
    .optional(),
  files: z.array(serializableCodeDiffFileSchema).default([]),
  actions: z.array(serializableCodeDiffActionSchema).optional(),
  receipt: serializableCodeDiffReceiptSchema.optional(),
  emphasisFileIds: z.array(z.string()).optional(),
});

export type SerializableCodeDiff = z.infer<typeof serializableCodeDiffSchema>;

export function parseSerializableCodeDiff(
  input: unknown,
): SerializableCodeDiff {
  return serializableCodeDiffSchema.parse(input);
}
