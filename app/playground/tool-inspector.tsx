"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tool } from "@/lib/playground";

export const ToolInspector = ({
  open,
  onOpenChange,
  tools,
  prototypeTitle,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  tools: Tool[];
  prototypeTitle: string;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{prototypeTitle} tools</DialogTitle>
        <DialogDescription>
          Review the tools available to this prototype. Assignments are
          code-defined for now.
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
        {tools.map((tool) => (
          <Card
            key={tool.name}
            className="rounded-lg border px-4 py-4 shadow-none"
          >
            <CardHeader className="px-0">
              <CardTitle className="text-base font-semibold">
                {tool.name}
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-muted-foreground">
                  UI: {tool.uiId ?? "fallback"}
                </span>
                <span className="text-muted-foreground">
                  Input schema: {tool.input ? "provided" : "—"}
                </span>
                <span className="text-muted-foreground">
                  Output schema: {tool.output ? "provided" : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);
