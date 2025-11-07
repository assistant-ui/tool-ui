"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
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
    <Button
      variant="outline"
      size="icon"
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className="bg-background relative shadow-sm"
      onClick={toggleTheme}
    >
      <Sun className={cn("size-4")} />
      <Moon className={cn("absolute size-4")} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
