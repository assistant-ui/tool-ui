"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import type { Tool } from "@/lib/playground";

const ToolItem = ({ tool }: { tool: Tool }) => (
  <Item variant="outline" className="shadow-none">
    <ItemContent>
      <ItemTitle className="text-base font-semibold">{tool.name}</ItemTitle>
      <div className="mt-1 flex flex-wrap gap-4 text-sm">
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
    </ItemContent>
  </Item>
);

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
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <ItemGroup className="space-y-3">
          {tools.map((tool) => (
            <ToolItem key={tool.name} tool={tool} />
          ))}
        </ItemGroup>
      </div>
    </DialogContent>
  </Dialog>
);
