import {
  DataTableProvider,
  DataTableTable,
  DataTableCards,
  DataTableResponsive,
  DataTableActions,
  DataTableSortAnnouncement,
  useDataTable,
} from "./data-table";

export const DataTable = {
  Provider: DataTableProvider,
  Table: DataTableTable,
  Cards: DataTableCards,
  Responsive: DataTableResponsive,
  Actions: DataTableActions,
  SortAnnouncement: DataTableSortAnnouncement,
} as const;

export { useDataTable };
export type { DataTableActionsProps } from "./data-table";
export { DataTableErrorBoundary } from "./error-boundary";

export { renderFormattedValue } from "./formatters";
export {
  NumberValue,
  CurrencyValue,
  PercentValue,
  DeltaValue,
  DateValue,
  BooleanValue,
  LinkValue,
  BadgeValue,
  StatusBadge,
  ArrayValue,
} from "./formatters";
export { parseSerializableDataTable } from "./schema";

export type {
  Column,
  DataTableProps,
  DataTableSerializableProps,
  DataTableClientProps,
  DataTableRowData,
  RowPrimitive,
  RowData,
  ColumnKey,
} from "./types";
export type { FormatConfig } from "./formatters";

export { sortData, parseNumericLike } from "./utilities";
