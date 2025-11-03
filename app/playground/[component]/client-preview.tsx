"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";
import { ControlsPanel } from "../components/controls-panel";
import { CodePanel } from "../components/code-panel";
import { DataTable } from "@/components/registry/data-table";
import { PresetName, presets } from "@/lib/sample-data";
import { usePlayground } from "../playground-context";

export function ClientPreview({ componentId }: { componentId: string }) {
  const { viewport } = usePlayground();
  const [currentPreset, setCurrentPreset] = useState<PresetName>("stocks");
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | undefined
  >(undefined);
  const [emptyMessage, setEmptyMessage] = useState("No data available");
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const handleSortChange = (
    newSortBy?: string,
    newDirection?: "asc" | "desc",
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const currentConfig = presets[currentPreset];

  const viewportWidths = {
    mobile: "375px",
    tablet: "768px",
    desktop: "100%",
  } as const;

  return (
    <div className="flex flex-1 overflow-clip">
      {/* Preview Panel */}
      <div className="flex flex-1 flex-col">
        <div className="bg-background flex-1 overflow-y-auto p-6">
          <div
            className="mx-auto transition-all"
            style={{
              width: viewportWidths[viewport],
              maxWidth: "100%",
            }}
          >
            {componentId === "data-table" && (
              <DataTable
                {...currentConfig}
                sortBy={sortBy}
                sortDirection={sortDirection}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
                onAction={(actionId, row) => {
                  console.log("Action:", actionId, "Row:", row);
                  alert(
                    `Action: ${actionId}\nRow: ${JSON.stringify(row, null, 2)}`,
                  );
                }}
              />
            )}
          </div>
        </div>

        {/* Code Panel - Spans full width */}
        <CodePanel
          config={currentConfig}
          sortBy={sortBy}
          sortDirection={sortDirection}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
      </div>

      {/* Right Panel - Controls (Collapsible) */}
      {!controlsCollapsed && (
        <aside className="bg-muted/30 w-80 shrink-0 overflow-y-auto border-l p-6">
          <ControlsPanel
            currentPreset={currentPreset}
            onSelectPreset={setCurrentPreset}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            emptyMessage={emptyMessage}
            onEmptyMessageChange={setEmptyMessage}
            onClose={() => setControlsCollapsed(true)}
          />
        </aside>
      )}

      {/* Floating Controls Button (when collapsed) */}
      {controlsCollapsed && (
        <Button
          variant="outline"
          size="icon"
          className="fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg"
          onClick={() => setControlsCollapsed(false)}
          title="Show controls"
        >
          <Monitor className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

