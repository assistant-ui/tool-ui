import type { ActionsProp } from "../shared";
import type { FormatConfig } from "./formatters";

/**
 * JSON primitive type that can be serialized.
 */
type JsonPrimitive = string | number | boolean | null;

/**
 * Valid row value types for serializable DataTable data.
 *
 * Supports:
 * - Primitives: string, number, boolean, null
 * - Arrays of primitives: string[], number[], boolean[], or mixed primitive arrays
 *
 * For complex data (objects with href/label, etc.), use column format configs
 * instead of putting objects in row data.
 *
 * @example
 * ```ts
 * // 👍 Good: Use primitives and primitive arrays
 * const row = {
 *   name: "Widget",
 *   price: 29.99,
 *   tags: ["electronics", "featured"],
 *   metrics: [1.2, 3.4, 5.6]
 * }
 *
 * // 🚫 Bad: Don't put objects in row data
 * const row = {
 *   link: { href: "/path", label: "Click" }  // Use format: { kind: 'link' } instead
 * }
 * ```
 */
export type RowPrimitive = JsonPrimitive | JsonPrimitive[];
export type DataTableRowData = Record<string, RowPrimitive>;
export type RowData = Record<string, unknown>;
export type ColumnKey<T extends object> = Extract<keyof T, string>;

export type FormatFor<V> = V extends number
  ? Extract<FormatConfig, { kind: "number" | "currency" | "percent" | "delta" }>
  : V extends boolean
    ? Extract<FormatConfig, { kind: "boolean" | "status" | "badge" }>
    : V extends (string | number | boolean | null)[]
      ? Extract<FormatConfig, { kind: "array" }>
      : V extends string
        ? Extract<
            FormatConfig,
            { kind: "text" | "link" | "date" | "badge" | "status" }
          >
        : Extract<FormatConfig, { kind: "text" }>;

/**
 * Column definition for DataTable
 *
 * @remarks
 * **Important:** Columns are sortable by default (opt-out pattern).
 * Set `sortable: false` explicitly to disable sorting for specific columns.
 */
export interface Column<
  T extends object = DataTableRowData,
  K extends ColumnKey<T> = ColumnKey<T>,
> {
  /** Unique identifier that maps to a key in the row data */
  key: K;
  /** Display text for the column header */
  label: string;
  /** Abbreviated label for narrow viewports */
  abbr?: string;
  /** Whether column is sortable. Default: true (opt-out pattern) */
  sortable?: boolean;
  /** Text alignment for column cells */
  align?: "left" | "right" | "center";
  /** Optional fixed width (CSS value) */
  width?: string;
  /** Enable text truncation with ellipsis */
  truncate?: boolean;
  /** Mobile display priority (primary = always visible, secondary = expandable, tertiary = hidden) */
  priority?: "primary" | "secondary" | "tertiary";
  /** Completely hide column on mobile viewports */
  hideOnMobile?: boolean;
  /** Formatting configuration for cell values */
  format?: FormatFor<T[K]>;
}

export interface Action {
  id: string;
  label: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  requiresConfirmation?: boolean;
}

/**
 * Serializable props that can come from LLM tool calls or be JSON-serialized.
 *
 * These props contain only primitive values, arrays, and plain objects -
 * no functions, class instances, or other non-serializable values.
 *
 * @example
 * ```tsx
 * const serializableProps: DataTableSerializableProps = {
 *   columns: [...],
 *   data: [...],
 *   actions: [...],
 *   rowIdKey: "id",
 *   defaultSort: { by: "price", direction: "desc" }
 * }
 * ```
 */
export interface DataTableSerializableProps<T extends object = RowData> {
  /** Column definitions */
  columns: Column<T>[];
  /** Row data (primitives only - no functions or class instances) */
  data: T[];
  /** Action button definitions */
  actions?: Action[];
  /**
   * Layout mode for the component.
   * - 'auto' (default): Container queries choose table/cards
   * - 'table': Force table layout
   * - 'cards': Force stacked card layout
   */
  layout?: "auto" | "table" | "cards";
  /**
   * Key in row data to use as unique identifier for React keys
   *
   * **Strongly recommended:** Always provide this for dynamic data to prevent
   * reconciliation issues (focus traps, animation glitches, incorrect state preservation)
   * when data reorders. Falls back to array index if omitted (only acceptable for static mock data).
   *
   * @example rowIdKey="id" or rowIdKey="uuid"
   */
  rowIdKey?: ColumnKey<T>;
  /**
   * Uncontrolled initial sort state (table manages its own sort state internally)
   *
   * **Sorting cycle:** Clicking column headers cycles through tri-state:
   * 1. none (unsorted) → 2. asc → 3. desc → 4. none (back to unsorted)
   *
   * @example
   * ```tsx
   * // Start with descending price sort
   * <DataTable defaultSort={{ by: "price", direction: "desc" }} />
   * ```
   */
  defaultSort?: { by?: ColumnKey<T>; direction?: "asc" | "desc" };
  /**
   * Controlled sort state (use with onSortChange from client props)
   *
   * When provided, you must also provide `onSortChange` to handle sort updates.
   * The table will cycle through: none → asc → desc → none.
   *
   * @example
   * ```tsx
   * const [sort, setSort] = useState({ by: "price", direction: "desc" })
   * <DataTable sort={sort} onSortChange={setSort} />
   * ```
   */
  sort?: { by?: ColumnKey<T>; direction?: "asc" | "desc" };
  /** Empty state message */
  emptyMessage?: string;
  /** Max table height with vertical scroll (CSS value) */
  maxHeight?: string;
  /** Message identifier for context (used with assistant-ui) */
  messageId?: string;
  /**
   * BCP47 locale for formatting and sorting (e.g., 'en-US', 'de-DE', 'ja-JP')
   *
   * Defaults to 'en-US' to ensure consistent server/client rendering.
   * Pass explicit locale for internationalization.
   *
   * @example
   * ```tsx
   * <DataTable locale="de-DE" /> // German formatting
   * <DataTable locale="ja-JP" /> // Japanese formatting
   * <DataTable />               // Uses 'en-US' default
   * ```
   */
  locale?: string;
}

/**
 * Client-side React-only props that cannot be serialized.
 *
 * These props contain functions, component state, or other React-specific values
 * that must be provided by your React code (not from LLM tool calls).
 *
 * @example
 * ```tsx
 * const clientProps: DataTableClientProps = {
 *   isLoading: false,
 *   className: "my-table",
 *   onAction: (id, row) => console.log(id, row),
 *   onSortChange: (next) => setSort(next)
 * }
 * ```
 */
export interface DataTableClientProps<T extends object = RowData> {
  /** Show loading skeleton */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /**
   * Optional preflight hook to decide whether an action should proceed.
   * Return false (or a Promise resolving to false) to cancel the action.
   *
   * Treats `requiresConfirmation` on the action as metadata only; the table
   * does not enforce confirmation.
   */
  onBeforeAction?: (args: {
    action: Action;
    row: T | DataTableRowData;
    messageId?: string;
  }) => boolean | Promise<boolean>;
  /** Action button click handler (required if actions are provided) */
  onAction?: (
    actionId: string,
    row: T,
    context?: {
      messageId?: string;
      sendMessage?: (message: string) => void;
    },
  ) => void;
  /**
   * Sort change handler for controlled mode (required if sort is provided)
   *
   * **Tri-state cycle behavior:**
   * - Click unsorted column: `{ by: "column", direction: "asc" }`
   * - Click asc column: `{ by: "column", direction: "desc" }`
   * - Click desc column: `{ by: "column", direction: undefined }` (returns to unsorted)
   * - Click different column: `{ by: "newColumn", direction: "asc" }`
   *
   * @example
   * ```tsx
   * const [sort, setSort] = useState<{ by?: string; direction?: "asc" | "desc" }>({})
   *
   * <DataTable
   *   sort={sort}
   *   onSortChange={(next) => {
   *     console.log("Sort changed:", next)
   *     setSort(next)
   *   }}
   * />
   * ```
   */
  onSortChange?: (next: {
    by?: ColumnKey<T>;
    direction?: "asc" | "desc";
  }) => void;
  /** Optional footer actions (separate from row actions), with inline config */
  tableActions?: ActionsProp;
  onTableAction?: (actionId: string) => void | Promise<void>;
  onBeforeTableAction?: (actionId: string) => boolean | Promise<boolean>;
}

/**
 * Complete props for the DataTable component.
 *
 * Combines serializable props (can come from LLM tool calls) with client-side
 * React-only props. This separation makes the boundary explicit and prevents
 * accidental serialization of non-serializable values.
 *
 * @see {@link DataTableSerializableProps} for props that can be JSON-serialized
 * @see {@link DataTableClientProps} for React-only props
 * @see {@link parseSerializableDataTable} for parsing LLM tool call results
 *
 * @example
 * ```tsx
 * // From LLM tool call
 * const serializableProps = parseSerializableDataTable(llmResult)
 *
 * // Combine with React-specific props
 * <DataTable
 *   {...serializableProps}
 *   onAction={(id, row) => handleAction(id, row)}
 *   onSortChange={setSort}
 *   isLoading={loading}
 * />
 * ```
 */
export interface DataTableProps<T extends object = RowData>
  extends DataTableSerializableProps<T>,
    DataTableClientProps<T> {}

export interface DataTableContextValue<T extends object = RowData> {
  columns: Column<T>[];
  data: T[];
  actions?: Action[];
  rowIdKey?: ColumnKey<T>;
  sortBy?: ColumnKey<T>;
  sortDirection?: "asc" | "desc";
  toggleSort?: (key: ColumnKey<T>) => void;
  onBeforeAction?: DataTableProps<T>["onBeforeAction"];
  onAction?: DataTableProps<T>["onAction"];
  messageId?: string;
  isLoading?: boolean;
  locale?: string;
}
