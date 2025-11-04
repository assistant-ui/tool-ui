"use client";

import * as React from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./_ui";
import { useDataTable, type DataTableRowData, type Action } from "./data-table";
import { getActionLabel } from "./utilities";

interface DataTableActionsProps {
  row: DataTableRowData;
}

export function DataTableActions({ row }: DataTableActionsProps) {
  const { actions, onAction, onBeforeAction, messageId } = useDataTable();

  if (!actions || !onAction) return null;

  const handleAction = async (action: Action) => {
    const proceed =
      (await onBeforeAction?.({ action, row, messageId })) ?? true;
    if (!proceed) return;
    onAction(action.id, row, { messageId });
  };

  if (actions.length <= 2) {
    return (
      <div className="ml-auto flex w-full justify-end gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || "default"}
            size="sm"
            aria-label={getActionLabel(action.label, row)}
            onClick={() => handleAction(action)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="ml-auto flex w-full justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 @md:h-8 @md:w-8"
          >
            <span className="sr-only">Open menu</span>
            <span aria-hidden className="inline-block text-base leading-none">
              ⋯
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              aria-label={getActionLabel(action.label, row)}
              onClick={() => handleAction(action)}
              className={
                action.variant === "destructive"
                  ? "text-destructive focus:text-destructive"
                  : undefined
              }
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
