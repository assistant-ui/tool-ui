"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSimulation, useWorkbenchStore } from "@/app/workbench/lib/store";
import type { ResponseMode } from "@/app/workbench/lib/types";
import { cn } from "@/lib/ui/cn";
import { ChevronDown } from "lucide-react";
import { JsonEditor } from "./json-editor";

const RESPONSE_MODES: Array<{
  value: ResponseMode;
  label: string;
  description: string;
}> = [
  {
    value: "success",
    label: "Success",
    description: "Return response data",
  },
  {
    value: "error",
    label: "Error",
    description: "Return an error response",
  },
  {
    value: "empty",
    label: "Empty",
    description: "Return empty object",
  },
  {
    value: "hang",
    label: "Hang",
    description: "Never respond (test loading)",
  },
];

function ResponseModeRadio({
  mode,
  selected,
  onSelect,
}: {
  mode: (typeof RESPONSE_MODES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md px-3 py-2 transition-colors",
        "hover:bg-muted/50",
        selected && "bg-muted/70",
      )}
    >
      <div className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center">
        <div
          className={cn(
            "size-4 rounded-full border-2 transition-colors",
            selected
              ? "border-primary bg-primary"
              : "border-muted-foreground/40",
          )}
        />
        {selected && (
          <div className="absolute size-1.5 rounded-full bg-white" />
        )}
      </div>
      <input
        type="radio"
        name="responseMode"
        value={mode.value}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium leading-none">{mode.label}</span>
        <span className="text-muted-foreground text-xs">{mode.description}</span>
      </div>
    </label>
  );
}

export function SimulationPanel() {
  const simulation = useSimulation();
  const [isDataExpanded, setIsDataExpanded] = useState(false);

  const { setSimulationEnabled, setResponseMode, setResponseData } =
    useWorkbenchStore(
      useShallow((s) => ({
        setSimulationEnabled: s.setSimulationEnabled,
        setResponseMode: s.setResponseMode,
        setResponseData: s.setResponseData,
      })),
    );

  const showDataEditor = simulation.responseMode !== "hang";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-border/40 flex h-9 shrink-0 items-center justify-between border-b px-3">
        <span className="text-muted-foreground text-xs font-medium">
          Response Simulation
        </span>
        <label className="flex cursor-pointer items-center gap-2">
          <span
            className={cn(
              "text-xs transition-colors",
              simulation.enabled ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {simulation.enabled ? "On" : "Off"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={simulation.enabled}
            onClick={() => setSimulationEnabled(!simulation.enabled)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              simulation.enabled ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform",
                simulation.enabled && "translate-x-4",
              )}
            />
          </button>
        </label>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden transition-opacity",
          !simulation.enabled && "pointer-events-none opacity-50",
        )}
      >
        <div className="scrollbar-subtle flex-1 overflow-y-auto">
          <div className="p-3">
            <p className="text-muted-foreground mb-3 text-xs">
              When the component calls back:
            </p>
            <div className="flex flex-col gap-1">
              {RESPONSE_MODES.map((mode) => (
                <ResponseModeRadio
                  key={mode.value}
                  mode={mode}
                  selected={simulation.responseMode === mode.value}
                  onSelect={() => setResponseMode(mode.value)}
                />
              ))}
            </div>
          </div>

          {showDataEditor && (
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
                    value={simulation.responseData}
                    onChange={setResponseData}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
