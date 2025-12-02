"use client";

import { useShallow } from "zustand/react/shallow";
import {
  useWorkbenchStore,
  useActiveJsonTab,
  useSelectedComponent,
} from "@/lib/workbench/store";
import type { ActiveJsonTab } from "@/lib/workbench/store";
import { getComponent } from "@/lib/workbench/component-registry";
import { JsonEditor } from "./json-editor";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

/**
 * JSON Panel - dedicated space for editing toolInput, toolOutput, widgetState, and toolResponseMetadata.
 * Provides tabbed interface with reset functionality per tab.
 */
export function JsonPanel() {
  const activeJsonTab = useActiveJsonTab();
  const selectedComponent = useSelectedComponent();

  const {
    toolInput,
    toolOutput,
    widgetState,
    toolResponseMetadata,
    setToolInput,
    setToolOutput,
    setWidgetState,
    setToolResponseMetadata,
    setActiveJsonTab,
  } = useWorkbenchStore(
    useShallow((s) => ({
      toolInput: s.toolInput,
      toolOutput: s.toolOutput,
      widgetState: s.widgetState,
      toolResponseMetadata: s.toolResponseMetadata,
      setToolInput: s.setToolInput,
      setToolOutput: s.setToolOutput,
      setWidgetState: s.setWidgetState,
      setToolResponseMetadata: s.setToolResponseMetadata,
      setActiveJsonTab: s.setActiveJsonTab,
    })),
  );

  const getActiveData = (): Record<string, unknown> => {
    switch (activeJsonTab) {
      case "toolInput":
        return toolInput;
      case "toolOutput":
        return toolOutput ?? {};
      case "widgetState":
        return widgetState ?? {};
      case "toolResponseMetadata":
        return toolResponseMetadata ?? {};
      default:
        return {};
    }
  };

  const handleChange = (value: Record<string, unknown>) => {
    const isEmpty = Object.keys(value).length === 0;

    switch (activeJsonTab) {
      case "toolInput":
        setToolInput(value);
        break;
      case "toolOutput":
        setToolOutput(isEmpty ? null : value);
        break;
      case "widgetState":
        setWidgetState(isEmpty ? null : value);
        break;
      case "toolResponseMetadata":
        setToolResponseMetadata(isEmpty ? null : value);
        break;
    }
  };

  const handleReset = () => {
    switch (activeJsonTab) {
      case "toolInput": {
        // Reset to component's default props
        const component = getComponent(selectedComponent);
        setToolInput(component?.defaultProps ?? {});
        break;
      }
      case "toolOutput":
        setToolOutput(null);
        break;
      case "widgetState":
        setWidgetState(null);
        break;
      case "toolResponseMetadata":
        setToolResponseMetadata(null);
        break;
    }
  };

  const tabLabels: Record<ActiveJsonTab, string> = {
    toolInput: "Tool Input",
    toolOutput: "Tool Output",
    widgetState: "Widget State",
    toolResponseMetadata: "Metadata",
  };

  return (
    <div className="bg-background relative isolate h-full">
      <div className="h-full overflow-y-auto bg-white dark:bg-[#0d1117]">
        <div
          className="pointer-events-none absolute top-0 z-10 h-20 w-full bg-linear-to-b from-white via-white to-transparent dark:from-[#0d1117] dark:via-[#0d1117]"
          aria-hidden="true"
        ></div>
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3">
          <Tabs
            value={activeJsonTab}
            onValueChange={(v) => setActiveJsonTab(v as ActiveJsonTab)}
          >
            <TabsList>
              <TabsTrigger value="toolInput">Tool Input</TabsTrigger>
              <TabsTrigger value="toolOutput">Output</TabsTrigger>
              <TabsTrigger value="widgetState">State</TabsTrigger>
              <TabsTrigger value="toolResponseMetadata">Metadata</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        </div>

        <JsonEditor
          key={activeJsonTab}
          label={tabLabels[activeJsonTab]}
          value={getActiveData()}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
