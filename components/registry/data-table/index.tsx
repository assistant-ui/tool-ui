// Placeholder DataTable component for Phase 1
// Will be fully implemented in Phase 2

import { Card } from "@/components/ui/card";

export interface DataTableProps {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    align?: "left" | "right" | "center";
    width?: string;
  }>;
  rows: Record<string, string | number | boolean | null>[];
  actions?: Array<{
    id: string;
    label: string;
    variant?: "default" | "secondary" | "ghost" | "destructive";
    requiresConfirmation?: boolean;
  }>;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  emptyMessage?: string;
  isLoading?: boolean;
  maxHeight?: string;
  messageId?: string;
  onAction?: (
    actionId: string,
    row: Record<string, any>,
    context?: {
      messageId?: string;
      sendMessage?: (message: string) => void;
    },
  ) => void;
  onSort?: (columnKey: string, direction: "asc" | "desc") => void;
}

export function DataTable({
  columns,
  rows,
  actions,
  sortBy,
  sortDirection,
  emptyMessage = "No data available",
  isLoading = false,
}: DataTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
        </div>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="border-b bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                  style={{ textAlign: column.align }}
                >
                  {column.label}
                  {sortBy === column.key && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b transition-colors hover:bg-muted/50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-3 text-sm"
                    style={{ textAlign: column.align }}
                  >
                    {row[column.key]?.toString() ?? "—"}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {actions.slice(0, 2).map((action) => (
                        <button
                          key={action.id}
                          className="rounded px-2 py-1 text-xs transition-colors hover:bg-muted"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
