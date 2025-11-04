import { z } from "zod";
import type { Action, Column, DataTableProps, RowData } from "./data-table";

const alignEnum = z.enum(["left", "right", "center"]);
const priorityEnum = z.enum(["primary", "secondary", "tertiary"]);
const variantEnum = z.enum(["default", "secondary", "ghost", "destructive"]);

const formatSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text") }),
  z.object({
    kind: z.literal("number"),
    decimals: z.number().optional(),
    unit: z.string().optional(),
    compact: z.boolean().optional(),
    showSign: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("currency"),
    currency: z.string(),
    decimals: z.number().optional(),
  }),
  z.object({
    kind: z.literal("percent"),
    decimals: z.number().optional(),
    showSign: z.boolean().optional(),
    basis: z.enum(["fraction", "unit"]).optional(),
  }),
  z.object({
    kind: z.literal("date"),
    dateFormat: z.enum(["short", "long", "relative"]).optional(),
  }),
  z.object({
    kind: z.literal("delta"),
    decimals: z.number().optional(),
    upIsPositive: z.boolean().optional(),
    showSign: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("status"),
    statusMap: z.record(
      z.object({
        tone: z.enum(["success", "warning", "danger", "info", "neutral"]),
        label: z.string().optional(),
      }),
    ),
  }),
  z.object({
    kind: z.literal("boolean"),
    labels: z
      .object({
        true: z.string(),
        false: z.string(),
      })
      .optional(),
  }),
  z.object({
    kind: z.literal("link"),
    hrefKey: z.string().optional(),
    external: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("badge"),
    colorMap: z
      .record(z.enum(["success", "warning", "danger", "info", "neutral"]))
      .optional(),
  }),
  z.object({
    kind: z.literal("array"),
    maxVisible: z.number().optional(),
  }),
]);

export const serializableColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  abbr: z.string().optional(),
  sortable: z.boolean().optional(),
  align: alignEnum.optional(),
  width: z.string().optional(),
  truncate: z.boolean().optional(),
  priority: priorityEnum.optional(),
  hideOnMobile: z.boolean().optional(),
  format: formatSchema.optional(),
});

export const serializableRowSchema = z.record(
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())])
);

export const serializableActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  variant: variantEnum.optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const serializableDataTableSchema = z.object({
  columns: z.array(serializableColumnSchema),
  rows: z.array(serializableRowSchema),
  actions: z.array(serializableActionSchema).optional(),
});

export type SerializableDataTable = z.infer<typeof serializableDataTableSchema>;

export function parseSerializableDataTable(
  input: unknown,
): Pick<DataTableProps<RowData>, "columns" | "data" | "actions"> {
  const res = serializableDataTableSchema.safeParse(input);
  if (!res.success) {
    throw new Error(`Invalid DataTable payload: ${res.error.message}`);
  }
  const { columns, rows, actions } = res.data;
  return {
    columns: columns as unknown as Column<RowData>[],
    data: rows as RowData[],
    actions: actions as Action[] | undefined,
  };
}
