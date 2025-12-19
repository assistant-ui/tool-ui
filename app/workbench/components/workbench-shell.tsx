"use client";

import * as React from "react";
import Link from "next/link";
import { WorkbenchLayout } from "./workbench-layout";
import { ConsoleSummaryBar } from "./console-summary-bar";
import { ConsoleDrawer } from "./console-drawer";
import { LogoMark } from "@/components/ui/logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSelectedComponent,
  useWorkbenchStore,
  useClearConsole,
  useDisplayMode,
  useIsConsoleOpen,
} from "@/app/workbench/lib/store";
import { useWorkbenchPersistence } from "@/app/workbench/lib/persistence";
import { workbenchComponents } from "@/app/workbench/lib/component-registry";
import { SELECT_CLASSES, COMPACT_SMALL_TEXT_CLASSES } from "./styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";
import { useTheme } from "next-themes";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { OnboardingModal } from "./onboarding-modal";

export function WorkbenchShell() {
  const [mounted, setMounted] = React.useState(false);
  const selectedComponent = useSelectedComponent();
  const setSelectedComponent = useWorkbenchStore((s) => s.setSelectedComponent);
  const setDisplayMode = useWorkbenchStore((s) => s.setDisplayMode);
  const setConsoleOpen = useWorkbenchStore((s) => s.setConsoleOpen);
  const displayMode = useDisplayMode();
  const isConsoleOpen = useIsConsoleOpen();
  const clearConsole = useClearConsole();
  const { setTheme, resolvedTheme } = useTheme();

  useWorkbenchPersistence();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = React.useCallback(() => {
    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }
    document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });
  }, [isDark, setTheme]);

  const toggleFullscreen = React.useCallback(() => {
    setDisplayMode(displayMode === "fullscreen" ? "inline" : "fullscreen");
  }, [displayMode, setDisplayMode]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /mac/i.test(navigator.userAgent);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        toggleTheme();
      }

      if (modKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }

      if (modKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (e.shiftKey) {
          clearConsole();
        } else {
          setConsoleOpen(!isConsoleOpen);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    toggleTheme,
    toggleFullscreen,
    clearConsole,
    isConsoleOpen,
    setConsoleOpen,
  ]);

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
          <span className="font-mono select-none">Workbench</span>
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-hidden">
          <WorkbenchLayout />
        </div>
        <ConsoleSummaryBar onClick={() => setConsoleOpen(true)} />
      </div>
      <ConsoleDrawer open={isConsoleOpen} onOpenChange={setConsoleOpen} />
      <OnboardingModal />
    </div>
  );
}
