"use client";

import { Column, DataTable, DataTableRowData } from "@/components/data-table";
import { getMockTasks } from "@/lib/mocks/tasks";
import { useEffect, useState } from "react";

export function TasksDemo() {
  const [rows, setRows] = useState<DataTableRowData[] | null>(null);

  useEffect(() => {
    getMockTasks().then((tasks) => {
      setRows(
        tasks.map((t) => ({
          id: t.id,
          issue: t.issue,
          customer: t.customer,
          priority: t.priority,
          status: t.status,
          assignee: t.assignee,
          created: t.created,
          urgencyOrder:
            t.priority === "high" ? 1 : t.priority === "medium" ? 2 : 3,
        })),
      );
    });
  }, []);

  const columns = [
    {
      key: "priority",
      label: "Urgency",
      format: {
        kind: "status" as const,
        statusMap: {
          high: { tone: "danger", label: "High" },
          medium: { tone: "warning", label: "Medium" },
          low: { tone: "neutral", label: "Low" },
        },
      },
    },
    {
      key: "issue",
      label: "Issue",
      truncate: true,
      priority: "primary" as const,
    },
    { key: "customer", label: "Customer", priority: "primary" as const },
    {
      key: "status",
      label: "Status",
      format: {
        kind: "badge" as const,
        colorMap: {
          open: "info",
          "in-progress": "warning",
          waiting: "neutral",
          done: "success",
        },
      },
    },
    { key: "assignee", label: "Owner" },
    {
      key: "created",
      label: "Created",
      format: { kind: "date" as const, dateFormat: "relative" as const },
      hideOnMobile: true,
    },
    { key: "urgencyOrder", label: "Order", hideOnMobile: true },
  ] satisfies Column<DataTableRowData>[];

  return (
    <div className="not-prose">
      <DataTable
        rowIdKey="id"
        columns={columns}
        data={rows ?? []}
        defaultSort={{ by: "urgencyOrder", direction: "asc" }}
        layout="table"
      />
    </div>
  );
}
