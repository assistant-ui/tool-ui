"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Moon, Smartphone, Sun, Tablet } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export type ViewportSize = "mobile" | "tablet" | "desktop";

type ViewportControlsProps = {
  viewport: ViewportSize;
  onViewportChange: (viewport: ViewportSize) => void;
};

export function ViewportControls({
  viewport,
  onViewportChange,
}: ViewportControlsProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="fixed top-4 right-4 z-20">
      <div className="bg-background shadow-crisp-edge flex gap-1 rounded-full rounded-md border shadow-sm">
        <Button
          variant={viewport === "mobile" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onViewportChange("mobile")}
          title="Mobile view"
        >
          <Smartphone className="h-4 w-4" />
        </Button>
        <Button
          variant={viewport === "tablet" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onViewportChange("tablet")}
          title="Tablet view"
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant={viewport === "desktop" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onViewportChange("desktop")}
          title="Desktop view"
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Toggle theme"
          aria-pressed={isDark}
          className="relative"
          onClick={toggleTheme}
        >
          <Sun
            className={cn(
              "h-4 w-4 transition-all",
              isDark ? "scale-0 rotate-90" : "scale-100 rotate-0",
            )}
          />
          <Moon
            className={cn(
              "absolute h-4 w-4 transition-all",
              isDark ? "scale-100 rotate-0" : "scale-0 -rotate-90",
            )}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </div>
  );
}
