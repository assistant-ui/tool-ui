"use client";

import * as React from "react";
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

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions>({});
  const pendingResolve = React.useRef<((val: boolean) => void) | undefined>(undefined);

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    setOptions(opts ?? {});
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      pendingResolve.current = resolve;
    });
  }, []);

  const handleCancel = () => {
    setOpen(false);
    pendingResolve.current?.(false);
  };

  const handleConfirm = () => {
    setOpen(false);
    pendingResolve.current?.(true);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title ?? "Confirm"}</AlertDialogTitle>
            {options.description && (
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus onClick={handleCancel}>
              {options.cancelText ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={options.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
            >
              {options.confirmText ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

// Example usage with DataTable onBeforeAction
//
// const confirm = useConfirm();
// <DataTable
//   actions={[{ id: 'delete', label: 'Delete', variant: 'destructive', requiresConfirmation: true }]}
//   onBeforeAction={({ action, row }) => {
//     if (!action.requiresConfirmation) return true;
//     return confirm({
//       title: `Confirm ${action.label}`,
//       description: `This will ${action.label.toLowerCase()} ${String((row as any).name ?? 'this item')}.`,
//       confirmText: action.label,
//       destructive: action.variant === 'destructive',
//     });
//   }}
// />
