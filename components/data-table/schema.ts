import { z } from "zod";
import type { Action, Column, DataTableProps, RowData } from "./data-table";

const alignEnum = z.enum(["left", "right", "center"]);
const priorityEnum = z.enum(["primary", "secondary", "tertiary"]);
const variantEnum = z.enum(["default", "secondary", "ghost", "destructive"]);

const formatKindEnum = z.enum([
  "text",
  "number",
  "currency",
  "percent",
  "date",
  "delta",
  "status",
  "boolean",
  "link",
  "badge",
  "array",
]);

const formatSchema = z.object({ kind: formatKindEnum }).passthrough();

export const serializableColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  abbr: z.string().optional(),
  sortable: z.boolean().optional(),
  align: alignEnum.optional(),
  width: z.string().optional(),
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

