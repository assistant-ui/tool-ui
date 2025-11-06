import * as React from "react";
import { cn } from "./_cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "./_ui";
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
  const {
    columns,
    actions,
    onAction,
    onBeforeAction,
    messageId,
    locale,
    rowIdKey,
  } = useDataTable();

  const { primary, secondary } = categorizeColumns(columns);

  const handleAction = async (action: Action, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const proceed =
      (await onBeforeAction?.({ action, row, messageId })) ?? true;
    if (!proceed) return;
    onAction?.(action.id, row, { messageId });
  };

  if (secondary.length === 0 && (!actions || actions.length === 0)) {
    return <SimpleCard row={row} columns={primary} index={index} />;
  }

  const primaryColumn = primary[0];
  const secondaryPrimary = primary.slice(1);

  const stableRowId =
    getRowIdentifier(row, rowIdKey ? String(rowIdKey) : undefined) ||
    `${index}-${primaryColumn?.key ?? "row"}`;

  const headingId = `row-${stableRowId}-heading`;
  const detailsId = `row-${stableRowId}-details`;
  const secondaryDataIds = secondaryPrimary.map(
    (col) => `row-${stableRowId}-${String(col.key)}`,
  );

  const primaryValue = primaryColumn
    ? String(row[primaryColumn.key] ?? "")
    : "";
  const rowLabel = `Row ${index + 1}: ${primaryValue}`;
  const itemValue = `row-${stableRowId}`;

  return (
    <Accordion
      type="single"
      collapsible
      className="overflow-clip rounded-lg border"
      role="listitem"
      aria-label={rowLabel}
    >
      <AccordionItem value={itemValue} className="group border-0">
        <AccordionTrigger
          className="hover:bg-muted group-data-[state=open]:bg-muted w-full rounded-none px-4 py-3 hover:no-underline"
          aria-controls={detailsId}
          aria-label={`${rowLabel}. ${secondary.length > 0 ? "Expand for details" : ""}`}
        >
          <div className="flex w-full items-start justify-between">
            <div className="min-w-0 flex-1">
              {primaryColumn && (
                <div
                  id={headingId}
                  role="heading"
                  aria-level={3}
                  className="truncate"
                  aria-label={`${primaryColumn.label}: ${row[primaryColumn.key]}`}
                >
                  {renderFormattedValue({
                    value: row[primaryColumn.key],
                    column: primaryColumn,
                    row,
                    locale,
                  })}
                </div>
              )}

              {secondaryPrimary.length > 0 && (
                <div
                  className="text-muted-foreground flex w-full flex-wrap gap-x-3 gap-y-1"
                  role="group"
                  aria-label="Summary information"
                >
                  {secondaryPrimary.map((col, idx) => (
                    <span
                      key={col.key}
                      id={secondaryDataIds[idx]}
                      className="flex min-w-0 gap-2"
                      role="cell"
                      aria-label={`${col.label}: ${row[col.key]}`}
                    >
                      <span className="sr-only">{col.label}: </span>
                      <span aria-hidden="true">{col.label}: </span>
                      <span className="truncate">
                        {renderFormattedValue({
                          value: row[col.key],
                          column: col,
                          row,
                          locale,
                        })}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent
          className={cn("flex flex-col gap-4", "px-4 pb-4")}
          id={detailsId}
          role="region"
          aria-labelledby={headingId}
        >
          {secondary.length > 0 && (
            <dl
              className={cn(
                "flex flex-col gap-2 pt-4",
                "group-data-[state=open]:animate-in group-data-[state=open]:fade-in-0",
                "group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0",
                "duration-150",
              )}
              role="list"
              aria-label="Additional data"
            >
              {secondary.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-4"
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
                      "text-foreground min-w-0 break-words",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                    )}
                    role="cell"
                    aria-labelledby={`row-${stableRowId}-${String(col.key)}-label`}
                  >
                    {renderFormattedValue({
                      value: row[col.key],
                      column: col,
                      row,
                      locale,
                    })}
                  </dd>
                </div>
              ))}
            </dl>
          )}

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
                  className="min-h-[44px] sm:min-h-auto"
                  aria-label={`${action.label} ${primaryValue}`}
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
  index,
}: {
  row: DataTableRowData;
  columns: Column[];
  index: number;
}) {
  const { onAction, onBeforeAction, actions, messageId, locale, rowIdKey } =
    useDataTable();
  const primaryColumn = columns[0];
  const otherColumns = columns.slice(1);

  const handleAction = async (action: Action) => {
    const proceed =
      (await onBeforeAction?.({ action, row, messageId })) ?? true;
    if (!proceed) return;
    onAction?.(action.id, row, { messageId });
  };

  const stableRowId =
    getRowIdentifier(row, rowIdKey ? String(rowIdKey) : undefined) ||
    `${index}-${primaryColumn?.key ?? "row"}`;

  const primaryValue = primaryColumn
    ? String(row[primaryColumn.key] ?? "")
    : "";
  const rowLabel = `Row ${index + 1}: ${primaryValue}`;

  return (
    <>
      <div
        className="flex flex-col gap-2 rounded-lg border p-4"
        role="listitem"
        aria-label={rowLabel}
      >
        {primaryColumn && (
          <div
            role="heading"
            aria-level={3}
            aria-label={`${primaryColumn.label}: ${row[primaryColumn.key]}`}
          >
            {renderFormattedValue({
              value: row[primaryColumn.key],
              column: primaryColumn,
              row,
              locale,
            })}
          </div>
        )}

        {otherColumns.map((col) => (
          <div
            key={col.key}
            className="flex items-start justify-between gap-4"
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
                "min-w-0 break-words",
                col.align === "right" && "text-right",
                col.align === "center" && "text-center",
              )}
              role="cell"
              aria-labelledby={`row-${stableRowId}-${String(col.key)}-label`}
            >
              {renderFormattedValue({
                value: row[col.key],
                column: col,
                row,
                locale,
              })}
            </span>
          </div>
        ))}

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
    </>
  );
}
