"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSimulation, useWorkbenchStore } from "@/app/workbench/lib/store";
import type { ResponseMode } from "@/app/workbench/lib/types";
import { DEFAULT_TOOL_CONFIG } from "@/app/workbench/lib/types";
import { cn } from "@/lib/ui/cn";
import { ChevronDown, Circle, AlertCircle, Loader2 } from "lucide-react";
import { JsonEditor } from "./json-editor";

const RESPONSE_MODES: Array<{
  value: ResponseMode;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: "success",
    label: "Success",
    icon: <Circle className="size-2.5 fill-emerald-500 text-emerald-500" />,
  },
  {
    value: "error",
    label: "Error",
    icon: <AlertCircle className="size-3 text-red-500" />,
  },
  {
    value: "hang",
    label: "Hang",
    icon: <Loader2 className="size-3 text-amber-500" />,
  },
];

function ToolItem({
  name,
  isSelected,
  responseMode,
  onSelect,
}: {
  name: string;
  isSelected: boolean;
  responseMode: ResponseMode;
  onSelect: () => void;
}) {
  const modeConfig = RESPONSE_MODES.find((m) => m.value === responseMode);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        "hover:bg-muted/50",
        isSelected && "bg-muted",
      )}
    >
      <code className="flex-1 truncate font-mono text-xs">{name}</code>
      <span className="flex items-center gap-1">{modeConfig?.icon}</span>
    </button>
  );
}

export function SimulationPanel() {
  const simulation = useSimulation();
  const [isDataExpanded, setIsDataExpanded] = useState(true);

  const { selectSimTool, setSimToolConfig } = useWorkbenchStore(
    useShallow((s) => ({
      selectSimTool: s.selectSimTool,
      setSimToolConfig: s.setSimToolConfig,
    })),
  );

  const toolNames = Object.keys(simulation.tools);
  const selectedTool = simulation.selectedTool;
  const selectedConfig = selectedTool
    ? (simulation.tools[selectedTool] ?? DEFAULT_TOOL_CONFIG)
    : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-border/40 flex h-9 shrink-0 items-center border-b px-3">
        <span className="text-muted-foreground text-xs font-medium">
          Response Simulation
        </span>
      </div>

      <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto">
        <div className="p-3">
          <p className="text-muted-foreground mb-2 text-xs font-medium">
            Registered Tools
          </p>
          {toolNames.length === 0 ? (
            <p className="text-muted-foreground/60 py-4 text-center text-xs italic">
              No tools registered yet.
              <br />
              Interact with a component to register tools.
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {toolNames.map((name) => (
                <ToolItem
                  key={name}
                  name={name}
                  isSelected={selectedTool === name}
                  responseMode={simulation.tools[name]?.responseMode ?? "success"}
                  onSelect={() => selectSimTool(name)}
                />
              ))}
            </div>
          )}
        </div>

        {selectedTool && selectedConfig && (
          <div className="border-border/40 border-t">
            <div className="p-3">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Response Mode
              </p>
              <div className="flex gap-1">
                {RESPONSE_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() =>
                      setSimToolConfig(selectedTool, {
                        responseMode: mode.value,
                      })
                    }
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors",
                      selectedConfig.responseMode === mode.value
                        ? "bg-muted font-medium"
                        : "hover:bg-muted/50",
                    )}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedConfig.responseMode !== "hang" && (
              <div className="border-border/40 border-t">
                <button
                  type="button"
                  onClick={() => setIsDataExpanded(!isDataExpanded)}
                  className="hover:bg-muted/30 flex w-full items-center gap-2 px-3 py-2 text-left transition-colors"
                >
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground/60 size-3.5 transition-transform duration-150",
                      isDataExpanded ? "rotate-0" : "-rotate-90",
                    )}
                  />
                  <span className="text-muted-foreground text-xs font-medium">
                    Response Data
                  </span>
                </button>
                {isDataExpanded && (
                  <div className="px-3 pb-3">
                    <JsonEditor
                      label="Response Data"
                      value={selectedConfig.responseData}
                      onChange={(data) =>
                        setSimToolConfig(selectedTool, { responseData: data })
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
