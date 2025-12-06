"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  function changeTheme(newTheme: string) {
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  }

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    changeTheme(isDark ? "light" : "dark");
  };

  return (
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
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
