"use client";

import { useState } from "react";
import { EventConsole } from "./event-console";
import { useOpenAIGlobals } from "@/lib/workbench/store";
import type { OpenAIGlobals } from "@/lib/workbench/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Globe } from "lucide-react";

export function InspectorPanel() {
  const [activeTab, setActiveTab] = useState<"console" | "globals">("console");
  const globals = useOpenAIGlobals();

  return (
    <div className="bg-background flex h-full flex-col">
      <div className="shrink-0 border-b px-3 py-2">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "console" | "globals")}
        >
          <TabsList>
            <TabsTrigger value="console" className="gap-1.5">
              <Terminal className="size-3.5" />
              Console
            </TabsTrigger>
            <TabsTrigger value="globals" className="gap-1.5">
              <Globe className="size-3.5" />
              Globals
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "console" && <EventConsole />}
        {activeTab === "globals" && <GlobalsView globals={globals} />}
      </div>
    </div>
  );
}

function GlobalsView({ globals }: { globals: OpenAIGlobals }) {
  const globalsJson = JSON.stringify(globals, null, 2);

  return (
    <div className="scrollbar-subtle h-full overflow-y-auto p-4">
      <div className="space-y-2">
        <div className="text-muted-foreground text-xs font-medium">
          Current window.openai globals (read-only)
        </div>
        <pre className="bg-muted rounded-md border p-3 font-mono text-xs">
          {globalsJson}
        </pre>
      </div>
    </div>
  );
}
