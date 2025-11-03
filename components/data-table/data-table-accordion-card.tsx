// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useDataTable } from "./data-table";
import type { Column } from "./data-table";

interface DataTableAccordionCardProps {
  row: Record<string, any>;
  index: number;
}

/**
 * Categorize columns based on priority
 * - primary: Always visible in collapsed state
 * - secondary: Visible in expanded accordion
 * - tertiary: Hidden on mobile
 */
function categorizeColumns(columns: Column[]) {
  const primary: Column[] = [];
  const secondary: Column[] = [];

  columns.forEach((col, index) => {
    // Skip if explicitly hidden on mobile
    if (col.hideOnMobile) return;

    // Use explicit priority if set
    if (col.priority === "primary") {
      primary.push(col);
    } else if (col.priority === "secondary") {
      secondary.push(col);
    } else if (col.priority === "tertiary") {
      // Skip tertiary on mobile
      return;
    } else {
      // Auto-assign: first 2-3 columns are primary, rest secondary
      if (index < 2) {
        primary.push(col);
      } else {
        secondary.push(col);
      }
    }
  });

  return { primary, secondary };
}

export function DataTableAccordionCard({
  row,
  index,
}: DataTableAccordionCardProps) {
  const { columns, actions, onAction, messageId } = useDataTable();
  const { primary, secondary } = categorizeColumns(columns);

  // If no secondary columns, render as simple card (no accordion)
  if (secondary.length === 0 && (!actions || actions.length === 0)) {
    return <SimpleCard row={row} columns={primary} />;
  }

  const primaryColumn = primary[0];
  const secondaryPrimary = primary.slice(1);

  return (
    <Accordion type="single" collapsible className="rounded-lg border">
      <AccordionItem value={`row-${index}`} className="border-0">
        <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 hover:no-underline">
          <div className="flex w-full items-start justify-between pr-2 text-left">
            <div className="min-w-0 flex-1">
              {/* Primary field (title) */}
              {primaryColumn && (
                <div className="truncate text-base font-medium">
                  {row[primaryColumn.key] ?? "—"}
                </div>
              )}

              {/* Secondary primary fields (subtitle area) */}
              {secondaryPrimary.length > 0 && (
                <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {secondaryPrimary.map((col) => (
                    <span key={col.key} className="truncate">
                      {col.label}:{" "}
                      <span className="font-medium">{row[col.key] ?? "—"}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-4 pb-4">
          {/* Secondary fields */}
          {secondary.length > 0 && (
            <dl className="mb-4 space-y-2">
              {secondary.map((col) => (
                <div
                  key={col.key}
                  className="flex justify-between gap-4 text-sm"
                >
                  <dt className="text-muted-foreground shrink-0">
                    {col.label}
                  </dt>
                  <dd
                    className={cn(
                      "text-foreground font-medium",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                    )}
                  >
                    {row[col.key] ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && onAction && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "default"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(action.id, row, { messageId });
                  }}
                  className="min-h-[44px]"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Simple card (no accordion) for when there are only primary columns
 */
function SimpleCard({
  row,
  columns,
}: {
  row: Record<string, any>;
  columns: Column[];
}) {
  const { onAction, actions, messageId } = useDataTable();
  const primaryColumn = columns[0];
  const otherColumns = columns.slice(1);

  return (
    <div className="space-y-2 rounded-lg border p-4">
      {/* Primary field */}
      {primaryColumn && (
        <div className="text-base font-medium">
          {row[primaryColumn.key] ?? "—"}
        </div>
      )}

      {/* Other columns */}
      {otherColumns.map((col) => (
        <div key={col.key} className="flex justify-between gap-4 text-sm">
          <span className="text-muted-foreground">{col.label}:</span>
          <span
            className={cn(
              "font-medium",
              col.align === "right" && "text-right",
              col.align === "center" && "text-center",
            )}
          >
            {row[col.key] ?? "—"}
          </span>
        </div>
      ))}

      {/* Actions */}
      {actions && actions.length > 0 && onAction && (
        <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "default"}
              size="sm"
              onClick={() => onAction(action.id, row, { messageId })}
              className="min-h-[44px]"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
