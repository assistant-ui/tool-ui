import { z } from "zod";
import {
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
  parseWithSchema,
} from "../shared";

export const SourceSchema = z.object({
  label: z.string(),
  iconUrl: z.url().optional(),
  url: z.url().optional(),
});

export type Source = z.infer<typeof SourceSchema>;

export const SerializableAudioSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  assetId: z.string(),
  src: z.url(),
  title: z.string().optional(),
  description: z.string().optional(),
  artwork: z.url().optional(),
  durationMs: z.number().int().positive().optional(),
  fileSizeBytes: z.number().int().positive().optional(),
  createdAt: z.string().datetime().optional(),
  locale: z.string().optional(),
  source: SourceSchema.optional(),
});

export type SerializableAudio = z.infer<typeof SerializableAudioSchema>;

export function parseSerializableAudio(input: unknown): SerializableAudio {
  return parseWithSchema(SerializableAudioSchema, input, "Audio");
}
