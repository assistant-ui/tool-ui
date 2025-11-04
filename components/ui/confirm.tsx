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
  const pendingResolve = React.useRef<((val: boolean) => void) | undefined>(
    undefined,
  );

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    // Resolve any in-flight confirm as cancelled before opening a new one
    if (pendingResolve.current) {
      pendingResolve.current(false);
      pendingResolve.current = undefined;
    }
    setOptions(opts ?? {});
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      pendingResolve.current = resolve;
    });
  }, []);

  const handleCancel = () => {
    setOpen(false);
    if (pendingResolve.current) {
      pendingResolve.current(false);
      pendingResolve.current = undefined;
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    if (pendingResolve.current) {
      pendingResolve.current(true);
      pendingResolve.current = undefined;
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next && pendingResolve.current) {
            // Closed via overlay/Escape: treat as cancel
            pendingResolve.current(false);
            pendingResolve.current = undefined;
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title ?? "Confirm"}</AlertDialogTitle>
            {options.description && (
              <AlertDialogDescription>
                {options.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus onClick={handleCancel}>
              {options.cancelText ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                options.destructive
                  ? "bg-destructive text-destructive hover:bg-destructive/90"
                  : undefined
              }
            >
              {options.confirmText ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
