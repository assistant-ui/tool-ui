import { z } from "zod";
import { ToolUIIdSchema, ToolUIRoleSchema } from "../shared/schema";
import { parseWithSchema } from "../shared/parse";

export const MessageDraftChannelSchema = z.enum(["email", "slack"]);

export type MessageDraftChannel = z.infer<typeof MessageDraftChannelSchema>;

export const MessageDraftOutcomeSchema = z.enum(["sent", "cancelled"]);

export type MessageDraftOutcome = z.infer<typeof MessageDraftOutcomeSchema>;

const SlackTargetSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("channel"),
    name: z.string().min(1),
    memberCount: z.number().optional(),
  }),
  z.object({ type: z.literal("dm"), name: z.string().min(1) }),
]);

export type SlackTarget = z.infer<typeof SlackTargetSchema>;

const EmailDraftBaseSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  body: z.string().min(1),
  channel: z.literal("email"),
  subject: z.string().min(1),
  from: z.string().optional(),
  to: z.array(z.string()).min(1),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
});

const SlackDraftBaseSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  body: z.string().min(1),
  channel: z.literal("slack"),
  target: SlackTargetSchema,
});

export const SerializableEmailDraftSchema = EmailDraftBaseSchema;

export const SerializableSlackDraftSchema = SlackDraftBaseSchema;

export const SerializableEmailDraftReceiptSchema =
  EmailDraftBaseSchema.extend({
    outcome: MessageDraftOutcomeSchema,
  });

export const SerializableSlackDraftReceiptSchema =
  SlackDraftBaseSchema.extend({
    outcome: MessageDraftOutcomeSchema,
  });

export const SerializableMessageDraftSchema = z.discriminatedUnion("channel", [
  SerializableEmailDraftSchema,
  SerializableSlackDraftSchema,
]);

export const SerializableMessageDraftReceiptSchema = z.discriminatedUnion(
  "channel",
  [SerializableEmailDraftReceiptSchema, SerializableSlackDraftReceiptSchema],
);

export type SerializableMessageDraft = z.infer<
  typeof SerializableMessageDraftSchema
>;

export type SerializableMessageDraftReceipt = z.infer<
  typeof SerializableMessageDraftReceiptSchema
>;

export type SerializableEmailDraft = z.infer<
  typeof SerializableEmailDraftSchema
>;

export type SerializableSlackDraft = z.infer<
  typeof SerializableSlackDraftSchema
>;

export type SerializableEmailDraftReceipt = z.infer<
  typeof SerializableEmailDraftReceiptSchema
>;

export type SerializableSlackDraftReceipt = z.infer<
  typeof SerializableSlackDraftReceiptSchema
>;

export function parseSerializableMessageDraft(
  input: unknown,
): SerializableMessageDraft {
  return parseWithSchema(
    SerializableMessageDraftSchema,
    input,
    "MessageDraft",
  );
}

export function parseSerializableMessageDraftReceipt(
  input: unknown,
): SerializableMessageDraftReceipt {
  return parseWithSchema(
    SerializableMessageDraftReceiptSchema,
    input,
    "MessageDraftReceipt",
  );
}

export type MessageDraftProps = SerializableMessageDraft & {
  className?: string;
  undoGracePeriod?: number;
  onSend?: () => void | Promise<void>;
  onUndo?: () => void;
  onCancel?: () => void;
};

export type MessageDraftReceiptProps = SerializableMessageDraftReceipt & {
  className?: string;
};
