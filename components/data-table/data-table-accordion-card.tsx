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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDataTable } from "./data-table";
import type { Column, DataTableRowData, Action } from "./data-table";
import { renderFormattedValue } from "./formatters";
import { getRowIdentifier } from "./utilities";

interface DataTableAccordionCardProps {
  row: DataTableRowData;
  index: number;
}

function categorizeColumns(columns: Column[]) {
  const primary: Column[] = [];
  const secondary: Column[] = [];

  let seenVisible = 0;
  columns.forEach((col) => {
    if (col.hideOnMobile) return;

    if (col.priority === "primary") {
      primary.push(col);
    } else if (col.priority === "secondary") {
      secondary.push(col);
    } else if (col.priority === "tertiary") {
      return;
    } else {
      if (seenVisible < 2) {
        primary.push(col);
      } else {
        secondary.push(col);
      }
      seenVisible++;
    }
  });

  return { primary, secondary };
}

export function DataTableAccordionCard({
  row,
  index,
}: DataTableAccordionCardProps) {
  const { columns, actions, onAction, messageId, locale, rowIdKey } = useDataTable();
  const [confirmingAction, setConfirmingAction] = React.useState<Action | null>(
    null,
  );
  const { primary, secondary } = categorizeColumns(columns);

  const handleAction = (action: Action, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (action.requiresConfirmation) {
      setConfirmingAction(action);
    } else {
      onAction?.(action.id, row, { messageId });
    }
  };

  const handleConfirm = () => {
    if (confirmingAction) {
      onAction?.(confirmingAction.id, row, { messageId });
      setConfirmingAction(null);
    }
  };

  // If no secondary columns, render as simple card (no accordion)
  if (secondary.length === 0 && (!actions || actions.length === 0)) {
    return <SimpleCard row={row} columns={primary} index={index} />;
  }

  const primaryColumn = primary[0];
  const secondaryPrimary = primary.slice(1);

  // Generate stable ID for accordion state and ARIA relationships
  // Use rowIdKey if available, otherwise fall back to composite key
  const stableRowId =
    getRowIdentifier(row, rowIdKey ? String(rowIdKey) : undefined) ||
    `${index}-${primaryColumn?.key ?? "row"}`;

  // Generate IDs for ARIA relationships using stable identifier
  const headingId = `row-${stableRowId}-heading`;
  const detailsId = `row-${stableRowId}-details`;
  const secondaryDataIds = secondaryPrimary.map((col) => `row-${stableRowId}-${String(col.key)}`);

  // Build accessible row label
  const primaryValue = primaryColumn
    ? String(row[primaryColumn.key] ?? "")
    : "";
  const rowLabel = `Row ${index + 1}: ${primaryValue}`;

  return (
    <Accordion type="single" collapsible className="rounded-lg border" role="row" aria-label={rowLabel}>
      <AccordionItem value={`row-${stableRowId}`} className="border-0">
        <AccordionTrigger
          className="hover:bg-muted/50 px-4 py-3 hover:no-underline"
          aria-label={`${rowLabel}. ${secondary.length > 0 ? 'Expand for details' : ''}`}
        >
          <div className="flex w-full items-start justify-between pr-2 text-left">
            <div className="min-w-0 flex-1">
              {/* Primary field (heading for the row) */}
              {primaryColumn && (
                <div
                  id={headingId}
                  role="heading"
                  aria-level={3}
                  className="truncate font-medium"
                  aria-label={`${primaryColumn.label}: ${row[primaryColumn.key]}`}
                >
                  {renderFormattedValue(
                    row[primaryColumn.key],
                    primaryColumn,
                    row,
                    { locale },
                  )}
                </div>
              )}

              {/* Secondary primary fields (subtitle area) */}
              {secondaryPrimary.length > 0 && (
                <div
                  className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1"
                  role="group"
                  aria-label="Summary information"
                >
                  {secondaryPrimary.map((col, idx) => (
                    <span
                      key={col.key}
                      id={secondaryDataIds[idx]}
                      className="truncate"
                      role="cell"
                      aria-label={`${col.label}: ${row[col.key]}`}
                    >
                      <span className="sr-only">{col.label}: </span>
                      <span aria-hidden="true">{col.label}: </span>
                      <span>
                        {renderFormattedValue(row[col.key], col, row, { locale })}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent
          className="px-4 pb-4"
          id={detailsId}
          role="region"
          aria-label="Row details"
        >
          {/* Secondary fields */}
          {secondary.length > 0 && (
            <dl className="mb-4 space-y-2" role="list" aria-label="Additional data">
              {secondary.map((col) => (
                <div
                  key={col.key}
                  className="flex justify-between gap-4"
                  role="listitem"
                >
                  <dt
                    className="text-muted-foreground shrink-0"
                    id={`row-${stableRowId}-${String(col.key)}-label`}
                  >
                    {col.label}
                  </dt>
                  <dd
                    className={cn(
                      "text-foreground",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                    )}
                    role="cell"
                    aria-labelledby={`row-${stableRowId}-${String(col.key)}-label`}
                  >
                    {renderFormattedValue(row[col.key], col, row, { locale })}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && onAction && (
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Row actions"
            >
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "default"}
                  size="sm"
                  onClick={(e) => handleAction(action, e)}
                  className="min-h-[44px]"
                  aria-label={`${action.label} ${primaryValue}`}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
      <AlertDialog
        open={!!confirmingAction}
        onOpenChange={(open) => !open && setConfirmingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmingAction ? `Confirm ${confirmingAction.label}` : "Confirm"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const id = getRowIdentifier(row);
                const actionText = confirmingAction?.label ?? 'this action';
                const base = id ? `${actionText} for ${id}` : actionText;
                return `This action cannot be undone. This will ${base.toLowerCase()}.`;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmingAction?.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {confirmingAction?.label ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Accordion>
  );
}

/**
 * Simple card (no accordion) for when there are only primary columns
 */
function SimpleCard({
  row,
  columns,
  index,
}: {
  row: DataTableRowData;
  columns: Column[];
  index: number;
}) {
  const { onAction, actions, messageId, locale, rowIdKey } = useDataTable();
  const [confirmingAction, setConfirmingAction] = React.useState<Action | null>(
    null,
  );
  const primaryColumn = columns[0];
  const otherColumns = columns.slice(1);

  const handleAction = (action: Action) => {
    if (action.requiresConfirmation) {
      setConfirmingAction(action);
    } else {
      onAction?.(action.id, row, { messageId });
    }
  };

  const handleConfirm = () => {
    if (confirmingAction) {
      onAction?.(confirmingAction.id, row, { messageId });
      setConfirmingAction(null);
    }
  };

  // Generate stable ID for ARIA relationships
  const stableRowId =
    getRowIdentifier(row, rowIdKey ? String(rowIdKey) : undefined) ||
    `${index}-${primaryColumn?.key ?? "row"}`;

  // Build accessible row label
  const primaryValue = primaryColumn
    ? String(row[primaryColumn.key] ?? "")
    : "";
  const rowLabel = `Row ${index + 1}: ${primaryValue}`;

  return (
    <>
      <div
        className="flex flex-col gap-2 rounded-lg border p-4"
        role="row"
        aria-label={rowLabel}
      >
        {primaryColumn && (
          <div
            role="heading"
            aria-level={3}
            className="font-medium"
            aria-label={`${primaryColumn.label}: ${row[primaryColumn.key]}`}
          >
            {renderFormattedValue(row[primaryColumn.key], primaryColumn, row, { locale })}
          </div>
        )}

        {otherColumns.map((col) => (
          <div
            key={col.key}
            className="flex justify-between gap-4"
            role="group"
          >
            <span
              className="text-muted-foreground"
              id={`row-${stableRowId}-${String(col.key)}-label`}
            >
              {col.label}:
            </span>
            <span
              className={cn(
                col.align === "right" && "text-right",
                col.align === "center" && "text-center",
              )}
              role="cell"
              aria-labelledby={`row-${stableRowId}-${String(col.key)}-label`}
            >
              {renderFormattedValue(row[col.key], col, row, { locale })}
            </span>
          </div>
        ))}

        {/* Actions */}
        {actions && actions.length > 0 && onAction && (
          <div
            className="mt-3 flex flex-wrap gap-2 border-t pt-3"
            role="group"
            aria-label="Row actions"
          >
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "default"}
                size="sm"
                onClick={() => handleAction(action)}
                className="min-h-[44px]"
                aria-label={`${action.label} ${primaryValue}`}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      <AlertDialog
        open={!!confirmingAction}
        onOpenChange={(open) => !open && setConfirmingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmingAction ? `Confirm ${confirmingAction.label}` : "Confirm"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                // SimpleCard lacks identifierKey; best-effort row identifier
                const id = getRowIdentifier(row);
                const actionText = confirmingAction?.label ?? 'this action';
                const base = id ? `${actionText} for ${id}` : actionText;
                return `This action cannot be undone. This will ${base.toLowerCase()}.`;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmingAction?.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {confirmingAction?.label ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
