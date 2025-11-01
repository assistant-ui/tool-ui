"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Moon, Sun, Monitor, Smartphone, Tablet } from "lucide-react";
import { ControlsPanel } from "./components/controls-panel";
import { CodePanel } from "./components/code-panel";
import { DataTable } from "@/components/registry/data-table";
import { PresetName, presets } from "@/lib/sample-data";

type ViewportSize = "mobile" | "tablet" | "desktop";

export default function PlaygroundPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [currentPreset, setCurrentPreset] = useState<PresetName>("stocks");
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | undefined>(
    undefined,
  );
  const [emptyMessage, setEmptyMessage] = useState("No data available");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

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
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">tool-ui Playground</h1>
          <span className="text-sm text-muted-foreground">DataTable</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Viewport Controls */}
          <div className="flex gap-1 rounded-md border p-1">
            <Button
              variant={viewport === "mobile" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewport("mobile")}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={viewport === "tablet" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewport("tablet")}
              title="Tablet view"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={viewport === "desktop" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewport("desktop")}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Controls */}
        <aside className="w-80 overflow-y-auto border-r bg-muted/30 p-6">
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
          />
        </aside>

        {/* Right Panel - Preview and Code */}
        <div className="flex flex-1 flex-col">
          {/* Preview Panel */}
          <div className="flex-1 overflow-y-auto bg-background p-6">
            <div
              className="mx-auto transition-all"
              style={{
                width: viewportWidths[viewport],
                maxWidth: "100%",
              }}
            >
              <DataTable
                {...currentConfig}
                sortBy={sortBy}
                sortDirection={sortDirection}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
                onAction={(actionId, row) => {
                  console.log("Action:", actionId, "Row:", row);
                  alert(`Action: ${actionId}\nRow: ${JSON.stringify(row, null, 2)}`);
                }}
              />
            </div>
          </div>

          {/* Code Panel - Collapsible at bottom */}
          <CodePanel
            config={currentConfig}
            sortBy={sortBy}
            sortDirection={sortDirection}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </div>
  );
}
