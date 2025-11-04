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

/**
 * JSON primitive types that can be serialized.
 * Includes strings, numbers, booleans, and null.
 */
const jsonPrimitive = z.union([z.string(), z.number(), z.boolean(), z.null()]);

/**
 * Schema for serializable row data.
 *
 * Supports:
 * - Primitives: string, number, boolean, null
 * - Arrays of primitives: string[], number[], boolean[], or mixed primitive arrays
 *
 * Does NOT support:
 * - Functions
 * - Class instances (Date, Map, Set, etc.)
 * - Plain objects (use format configs instead)
 *
 * @example
 * Valid row data:
 * ```json
 * {
 *   "name": "Widget",
 *   "price": 29.99,
 *   "active": true,
 *   "tags": ["electronics", "featured"],
 *   "metrics": [1.2, 3.4, 5.6],
 *   "flags": [true, false, true],
 *   "mixed": ["label", 42, true]
 * }
 * ```
 */
export const serializableRowSchema = z.record(
  z.union([jsonPrimitive, z.array(jsonPrimitive)])
);

export const serializableActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  variant: variantEnum.optional(),
  requiresConfirmation: z.boolean().optional(),
});

/**
 * Zod schema for validating DataTable payloads from LLM tool calls.
 *
 * This schema validates the serializable parts of a DataTable:
 * - columns: Column definitions (keys, labels, formatting, etc.)
 * - rows: Data rows (primitives only - no functions or class instances)
 * - actions: Action button definitions (ids, labels, variants)
 *
 * Non-serializable props like `onAction`, `onSortChange`, `className`, and `isLoading`
 * must be provided separately in your React component.
 *
 * @example
 * ```ts
 * const result = serializableDataTableSchema.safeParse(llmResponse)
 * if (result.success) {
 *   // result.data contains validated columns, rows, and actions
 * }
 * ```
 */
export const serializableDataTableSchema = z.object({
  columns: z.array(serializableColumnSchema),
  rows: z.array(serializableRowSchema),
  actions: z.array(serializableActionSchema).optional(),
});

/**
 * Type representing the serializable parts of a DataTable payload.
 *
 * This type includes only JSON-serializable data that can come from LLM tool calls:
 * - Column definitions (format configs, alignment, labels, etc.)
 * - Row data (primitives: strings, numbers, booleans, null, string arrays)
 * - Action definitions (button labels and variants)
 *
 * Excluded from this type:
 * - Event handlers (`onAction`, `onSortChange`)
 * - React-specific props (`className`, `isLoading`)
 *
 * @example
 * ```ts
 * const payload: SerializableDataTable = {
 *   columns: [
 *     { key: "name", label: "Name" },
 *     { key: "price", label: "Price", format: { kind: "currency", currency: "USD" } }
 *   ],
 *   rows: [
 *     { name: "Widget", price: 29.99 }
 *   ]
 * }
 * ```
 */
export type SerializableDataTable = z.infer<typeof serializableDataTableSchema>;

/**
 * Validates and parses a DataTable payload from unknown data (e.g., LLM tool call result).
 *
 * This function:
 * 1. Validates the input against the `serializableDataTableSchema`
 * 2. Throws a descriptive error if validation fails
 * 3. Returns typed serializable props ready to pass to the `<DataTable>` component
 *
 * The returned props are **serializable only** - you must provide client-side props
 * separately (onAction, onSortChange, isLoading, className).
 *
 * @param input - Unknown data to validate (typically from an LLM tool call)
 * @returns Validated and typed DataTable serializable props (columns, data, actions)
 * @throws Error with validation details if input is invalid
 *
 * @example
 * ```tsx
 * function MyToolUI({ result }: { result: unknown }) {
 *   const serializableProps = parseSerializableDataTable(result)
 *
 *   return (
 *     <DataTable
 *       {...serializableProps}
 *       onAction={(id, row) => console.log(id, row)}
 *     />
 *   )
 * }
 * ```
 */
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
