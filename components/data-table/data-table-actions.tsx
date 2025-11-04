"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable, type DataTableRowData, type Action } from "./data-table";
import { getActionLabel } from "./utilities";

interface DataTableActionsProps {
  row: DataTableRowData;
}

export function DataTableActions({ row }: DataTableActionsProps) {
  const { actions, onAction, onBeforeAction, messageId } = useDataTable();

  if (!actions || !onAction) return null;

  const handleAction = async (action: Action) => {
    const proceed = (await onBeforeAction?.({ action, row, messageId })) ?? true;
    if (!proceed) return;
    onAction(action.id, row, { messageId });
  };

  if (actions.length <= 2) {
    return (
      <>
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "default"}
              size="sm"
              aria-label={getActionLabel(action.label, row)}
              onClick={() => handleAction(action)}
              className="min-h-[44px] @md:min-h-[36px]"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 @md:h-8 @md:w-8"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
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
                  ? "text-destructive-foreground focus:text-destructive-foreground"
                  : undefined
              }
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
