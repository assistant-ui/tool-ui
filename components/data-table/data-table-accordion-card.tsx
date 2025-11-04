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
  const { columns, actions, onAction, messageId } = useDataTable();
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
                <div className="truncate">
                  {renderFormattedValue(
                    row[primaryColumn.key],
                    primaryColumn,
                    row,
                  )}
                </div>
              )}

              {/* Secondary primary fields (subtitle area) */}
              {secondaryPrimary.length > 0 && (
                <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {secondaryPrimary.map((col) => (
                    <span key={col.key} className="truncate">
                      {col.label}:{" "}
                      <span>
                        {renderFormattedValue(row[col.key], col, row)}
                      </span>
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
                <div key={col.key} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">
                    {col.label}
                  </dt>
                  <dd
                    className={cn(
                      "text-foreground",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                    )}
                  >
                    {renderFormattedValue(row[col.key], col, row)}
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
                  onClick={(e) => handleAction(action, e)}
                  className="min-h-[44px]"
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will{" "}
              {confirmingAction?.label.toLowerCase()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmingAction?.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              Continue
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
}: {
  row: DataTableRowData;
  columns: Column[];
}) {
  const { onAction, actions, messageId } = useDataTable();
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

  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg border p-4">
        {primaryColumn && (
          <div className="">
            {renderFormattedValue(row[primaryColumn.key], primaryColumn, row)}
          </div>
        )}

        {otherColumns.map((col) => (
          <div key={col.key} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{col.label}:</span>
            <span
              className={cn(
                col.align === "right" && "text-right",
                col.align === "center" && "text-center",
              )}
            >
              {renderFormattedValue(row[col.key], col, row)}
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
                onClick={() => handleAction(action)}
                className="min-h-[44px]"
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will{" "}
              {confirmingAction?.label.toLowerCase()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmingAction?.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
