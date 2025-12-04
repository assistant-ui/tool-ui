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
import { TAB_LIST_CLASSES, TAB_TRIGGER_CLASSES } from "./styles";

export function InspectorPanel() {
  const [activeTab, setActiveTab] = useState<"console" | "globals">("console");
  const globals = useOpenAIGlobals();

  return (
    <div className="relative isolate flex h-full flex-col bg-neutral-100 dark:bg-neutral-950">
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div
          className="pointer-events-none absolute top-0 z-10 h-20 w-full bg-linear-to-b from-neutral-100 via-neutral-100 to-transparent dark:from-neutral-950 dark:via-neutral-950"
          aria-hidden="true"
        />

        <div className="sticky top-0 z-20 p-2">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "console" | "globals")}
          >
            <TabsList className={TAB_LIST_CLASSES}>
              <TabsTrigger
                value="console"
                className={`${TAB_TRIGGER_CLASSES} gap-1.5`}
              >
                <Terminal className="size-3.5" />
                Console
              </TabsTrigger>
              <TabsTrigger
                value="globals"
                className={`${TAB_TRIGGER_CLASSES} gap-1.5`}
              >
                <Globe className="size-3.5" />
                Globals
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1">
          {activeTab === "console" && <EventConsole />}
          {activeTab === "globals" && <GlobalsView globals={globals} />}
        </div>
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
