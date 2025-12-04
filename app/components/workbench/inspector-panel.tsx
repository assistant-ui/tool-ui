"use client";

import { useState, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { useTheme } from "next-themes";
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
      <div className="shrink-0 px-2 py-2">
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

const readOnlyStyle = EditorView.theme({
  "&": {
    fontSize: "14px",
    fontFamily: "ui-monospace, monospace",
  },
  ".cm-content": {
    padding: "16px",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    borderRight: "none",
    marginLeft: "8px",
    userSelect: "none",
    pointerEvents: "none",
  },
  ".cm-line": {
    padding: "0",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-cursor": {
    display: "none",
  },
});

function GlobalsView({ globals }: { globals: OpenAIGlobals }) {
  const globalsJson = JSON.stringify(globals, null, 2);
  const { theme } = useTheme();

  const extensions = useMemo(
    () => [
      json(),
      EditorView.lineWrapping,
      readOnlyStyle,
      EditorView.editable.of(false),
    ],
    [],
  );

  return (
    <div className="scrollbar-subtle h-full overflow-y-auto">
      <CodeMirror
        value={globalsJson}
        height="100%"
        extensions={extensions}
        theme={theme === "dark" ? githubDark : githubLight}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLineGutter: false,
          highlightActiveLine: false,
        }}
        className="h-full [&_.cm-editor]:h-full [&_.cm-editor]:bg-transparent! [&_.cm-gutters]:bg-transparent! [&_.cm-lineNumbers]:text-[rgba(0,0,0,0.25)]! dark:[&_.cm-lineNumbers]:text-[rgba(255,255,255,0.35)]! [&_.cm-scroller]:h-full"
      />
    </div>
  );
}
