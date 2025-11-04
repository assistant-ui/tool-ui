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
import { useDataTable, type DataTableRowData, type Action } from "./data-table";
import { getActionLabel, getConfirmDescription } from "./utilities";

interface DataTableActionsProps {
  row: DataTableRowData;
}

export function DataTableActions({ row }: DataTableActionsProps) {
  const { actions, onAction, messageId } = useDataTable();
  const [confirmingAction, setConfirmingAction] = React.useState<Action | null>(
    null,
  );

  if (!actions || !onAction) return null;

  const handleAction = (action: Action) => {
    if (action.requiresConfirmation) {
      setConfirmingAction(action);
    } else {
      onAction(action.id, row, { messageId });
    }
  };

  const handleConfirm = () => {
    if (confirmingAction) {
      onAction(confirmingAction.id, row, { messageId });
      setConfirmingAction(null);
    }
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
                {getConfirmDescription(row, confirmingAction?.label)}
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 @md:h-8 @md:w-8" // 40px on mobile, 32px on desktop
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
              {getConfirmDescription(row, confirmingAction?.label)}
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
