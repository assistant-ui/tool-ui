"use client";

import * as React from "react";
import Link from "next/link";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ConfigPanel } from "./config-panel";
import { UnifiedWorkspace } from "./unified-workspace";
import { InspectorPanel } from "./inspector-panel";
import { LogoMark } from "@/components/ui/logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelectedComponent, useWorkbenchStore } from "@/lib/workbench/store";
import {
  useWorkbenchPersistence,
  PANEL_AUTO_SAVE_IDS,
} from "@/lib/workbench/persistence";
import { workbenchComponents } from "@/lib/workbench/component-registry";
import { SELECT_CLASSES, COMPACT_SMALL_TEXT_CLASSES } from "./styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";
import { useTheme } from "next-themes";
import { ArrowLeft, Moon, Sun } from "lucide-react";

const WORKSPACE_MIN_SIZE = 50;
const CONSOLE_DEFAULT_SIZE = 25;
const CONSOLE_MIN_SIZE = 10;

export function WorkbenchShell() {
  const [isPanelCollapsed, setIsPanelCollapsed] = React.useState(false);
  const [isFading, setIsFading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const selectedComponent = useSelectedComponent();
  const setSelectedComponent = useWorkbenchStore((s) => s.setSelectedComponent);
  const { setTheme, resolvedTheme } = useTheme();

  useWorkbenchPersistence();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }
    document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });
  };

  const handleToggleCollapse = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsPanelCollapsed(!isPanelCollapsed);
      setIsFading(false);
    }, 150);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground hover:bg-muted -ml-1.5 rounded-md p-1.5 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <LogoMark className="size-5 shrink-0" />
          <span className="font-mono font-medium select-none">Workbench</span>
        </div>

        <div className="flex flex-1 justify-center">
          <Select
            value={selectedComponent}
            onValueChange={setSelectedComponent}
          >
            <SelectTrigger className={`${SELECT_CLASSES} text-sm font-medium`}>
              <SelectValue placeholder="Select component" />
            </SelectTrigger>
            <SelectContent>
              {workbenchComponents.map((comp) => (
                <SelectItem
                  className={`${COMPACT_SMALL_TEXT_CLASSES} text-sm`}
                  key={comp.id}
                  value={comp.id}
                >
                  {comp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <div className="pointer-events-none invisible flex items-center gap-3">
            <div className="-ml-1.5 p-1.5">
              <ArrowLeft className="size-4" />
            </div>
            <LogoMark className="size-5 shrink-0" />
            <span className="font-mono font-medium select-none">Workbench</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            aria-pressed={isDark}
            className="text-muted-foreground hover:text-foreground hover:bg-muted relative size-7 rounded-md transition-colors"
            onClick={toggleTheme}
          >
            <Sun
              className={cn(
                "size-4 transition-all",
                isDark ? "scale-0 rotate-90" : "scale-100 rotate-0",
              )}
            />
            <Moon
              className={cn(
                "absolute size-4 transition-all",
                isDark ? "scale-100 rotate-0" : "scale-0 -rotate-90",
              )}
            />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tr-lg border-t border-r">
          <PanelGroup
            direction="vertical"
            autoSaveId={PANEL_AUTO_SAVE_IDS.SHELL_VERTICAL}
          >
            <Panel
              defaultSize={100 - CONSOLE_DEFAULT_SIZE}
              minSize={WORKSPACE_MIN_SIZE}
              className="overflow-hidden"
            >
              <UnifiedWorkspace />
            </Panel>

            <PanelResizeHandle
              className="group relative z-20 h-px shrink-0 cursor-row-resize"
              style={{ viewTransitionName: "none" } as React.CSSProperties}
            >
              <div className="bg-border absolute inset-x-0 top-1/2 h-px -translate-y-1/2 transition-colors group-hover:bg-neutral-400 group-data-resize-handle-active:bg-neutral-500 dark:group-hover:bg-neutral-500 dark:group-data-resize-handle-active:bg-neutral-400" />
              <div className="absolute inset-x-0 -top-1.5 -bottom-1.5" />
            </PanelResizeHandle>

            <Panel
              defaultSize={CONSOLE_DEFAULT_SIZE}
              minSize={CONSOLE_MIN_SIZE}
            >
              <InspectorPanel />
            </Panel>
          </PanelGroup>
        </div>
        <aside
          className={`scrollbar-subtle flex h-full shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-in-out ${
            isPanelCollapsed ? "w-12" : "w-80"
          }`}
        >
          <div
            className={`h-full pt-2 transition-opacity duration-150 ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          >
            <ConfigPanel
              key={isPanelCollapsed ? "collapsed" : "expanded"}
              isCollapsed={isPanelCollapsed}
              onToggleCollapse={handleToggleCollapse}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
