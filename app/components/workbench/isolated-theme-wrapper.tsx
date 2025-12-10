"use client";

import type { ReactNode, CSSProperties } from "react";
import { useWorkbenchStore, useDisplayMode } from "@/lib/workbench/store";
import { cn } from "@/lib/ui/cn";

const LIGHT_THEME_VARS: CSSProperties = {
  "--background": "240 5% 96%",
  "--foreground": "240 10% 3.9%",
  "--card": "0 0% 100%",
  "--card-foreground": "240 10% 3.9%",
  "--primary": "240 5.9% 10%",
  "--primary-foreground": "0 0% 98%",
  "--muted": "240 4.8% 95.9%",
  "--muted-foreground": "240 3.8% 46.1%",
  "--border": "240 5.9% 90%",
} as CSSProperties;

const DARK_THEME_VARS: CSSProperties = {
  "--background": "240 0% 8%",
  "--foreground": "0 0% 98%",
  "--card": "240 10% 3.9%",
  "--card-foreground": "0 0% 98%",
  "--primary": "0 0% 98%",
  "--primary-foreground": "240 5.9% 10%",
  "--muted": "240 3.7% 15.9%",
  "--muted-foreground": "240 5% 64.9%",
  "--border": "240 3.7% 15.9%",
} as CSSProperties;

const THEME_VARS = {
  light: LIGHT_THEME_VARS,
  dark: DARK_THEME_VARS,
} as const;

interface IsolatedThemeWrapperProps {
  children: ReactNode;
  className?: string;
}

export function IsolatedThemeWrapper({
  children,
  className,
}: IsolatedThemeWrapperProps) {
  const theme = useWorkbenchStore((s) => s.theme);
  const displayMode = useDisplayMode();
  const safeAreaInsets = useWorkbenchStore((s) => s.safeAreaInsets);

  const themeVars = THEME_VARS[theme];
  const insetStyle: CSSProperties =
    displayMode === "fullscreen"
      ? {
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
        }
      : {};

  return (
    <div
      data-theme={theme}
      className={cn("bg-card text-foreground transition-colors", className)}
      style={{ colorScheme: theme, ...themeVars, ...insetStyle }}
    >
      {children}
    </div>
  );
}
