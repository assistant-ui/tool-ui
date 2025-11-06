"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export type ViewportSize = "mobile" | "desktop";

type ViewportControlsProps = {
  viewport: ViewportSize;
  onViewportChange: (viewport: ViewportSize) => void;
  showThemeToggle?: boolean;
  showViewportButtons?: boolean;
  fixed?: boolean;
};

export function ViewportControls({
  viewport,
  onViewportChange,
  showThemeToggle = false,
  showViewportButtons = true,
  fixed = false,
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

  const controlsContent = (
    <ButtonGroup>
      {showViewportButtons && (
        <>
          <Button
            variant={viewport === "mobile" ? "secondary" : "outline"}
            size="icon"
            onClick={() => onViewportChange("mobile")}
            title="Mobile view"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === "desktop" ? "secondary" : "outline"}
            size="icon"
            onClick={() => onViewportChange("desktop")}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </>
      )}
      {showThemeToggle && (
        <Button
          variant="outline"
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
      )}
    </ButtonGroup>
  );

  if (fixed) {
    return (
      <div className="fixed top-4 right-4 z-20">
        {controlsContent}
      </div>
    );
  }

  return controlsContent;
}
