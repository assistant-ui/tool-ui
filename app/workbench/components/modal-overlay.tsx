"use client";

import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { View } from "@/lib/workbench/types";

interface ModalOverlayProps {
  view: View;
  onClose: () => void;
}

export function ModalOverlay({ view, onClose }: ModalOverlayProps) {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  const params = view.params ?? {};
  const title =
    typeof params.title === "string" ? params.title : "Modal View";
  const description =
    typeof params.description === "string" ? params.description : null;

  return (
    <Dialog open={view.mode === "modal"} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Modal Params
            </div>
            <pre className="text-foreground overflow-auto text-sm">
              {JSON.stringify(params, null, 2)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
