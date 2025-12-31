"use client";

import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWorkbenchStore, useSimulation } from "@/lib/workbench/store";
import type { ResponseMode, ToolSimulationConfig } from "@/lib/workbench/types";
import { cn } from "@/lib/ui/cn";
import { Circle, AlertCircle, Loader2, ChevronDown, RotateCcw } from "lucide-react";
import { JsonEditor } from "./json-editor";

const RESPONSE_MODES: Array<{
  value: ResponseMode;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: "success",
    label: "Success",
    icon: <Circle className="size-2 fill-emerald-500 text-emerald-500" />,
  },
  {
    value: "error",
    label: "Error",
    icon: <AlertCircle className="size-2.5 text-red-500" />,
  },
  {
    value: "hang",
    label: "Hang",
    icon: <Loader2 className="size-2.5 text-amber-500" />,
  },
];

interface InlineResponseConfigProps {
  toolName: string;
  lastResponseData?: unknown;
  className?: string;
}

export function InlineResponseConfig({
  toolName,
  lastResponseData,
  className,
}: InlineResponseConfigProps) {
  const simulation = useSimulation();
  const [isDataExpanded, setIsDataExpanded] = useState(true);

  const { setSimToolConfig } = useWorkbenchStore(
    useShallow((s) => ({
      setSimToolConfig: s.setSimToolConfig,
    })),
  );

  const existingConfig = simulation.tools[toolName];

  useEffect(() => {
    if (!existingConfig && lastResponseData && typeof lastResponseData === "object") {
      setSimToolConfig(toolName, {
        responseMode: "success",
        responseData: lastResponseData as Record<string, unknown>,
      });
    }
  }, [toolName, existingConfig, lastResponseData, setSimToolConfig]);

  const config = existingConfig ?? {
    responseMode: "success" as const,
    responseData:
      lastResponseData && typeof lastResponseData === "object"
        ? (lastResponseData as Record<string, unknown>)
        : { success: true },
  };
  const isDefault =
    config.responseMode === "success" &&
    JSON.stringify(config.responseData) === JSON.stringify({ success: true });

  const handleReset = () => {
    setSimToolConfig(toolName, {
      responseMode: "success",
      responseData: { success: true },
    });
  };

  return (
    <div
      className={cn(
        "bg-muted/30 border-border/40 rounded-md border",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
        <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
          Next Response
        </span>
        {!isDefault && (
          <button
            type="button"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px] transition-colors"
          >
            <RotateCcw className="size-2.5" />
            Reset
          </button>
        )}
      </div>

      <div className="border-border/40 flex gap-0.5 border-t px-2 py-1.5">
        {RESPONSE_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() =>
              setSimToolConfig(toolName, { responseMode: mode.value })
            }
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1 text-[11px] transition-colors",
              config.responseMode === mode.value
                ? "bg-background shadow-sm font-medium"
                : "hover:bg-muted/50 text-muted-foreground",
            )}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>

      {config.responseMode !== "hang" && (
        <div className="border-border/40 border-t">
          <button
            type="button"
            onClick={() => setIsDataExpanded(!isDataExpanded)}
            className="hover:bg-muted/30 flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors"
          >
            <ChevronDown
              className={cn(
                "text-muted-foreground/60 size-3 transition-transform duration-150",
                isDataExpanded ? "rotate-0" : "-rotate-90",
              )}
            />
            <span className="text-muted-foreground text-[10px] font-medium">
              Response Data
            </span>
          </button>
          {isDataExpanded && (
            <div className="px-2 pb-2">
              <JsonEditor
                label="Response Data"
                value={config.responseData}
                onChange={(data) =>
                  setSimToolConfig(toolName, { responseData: data })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function useToolHasCustomConfig(toolName: string): boolean {
  const simulation = useSimulation();
  const config = simulation.tools[toolName];
  if (!config) return false;

  return (
    config.responseMode !== "success" ||
    JSON.stringify(config.responseData) !== JSON.stringify({ success: true })
  );
}
