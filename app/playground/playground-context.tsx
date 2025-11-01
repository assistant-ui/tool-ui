"use client";

import { createContext, useContext, ReactNode } from "react";

type ViewportSize = "mobile" | "tablet" | "desktop";

interface PlaygroundContextType {
  viewport: ViewportSize;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(
  undefined,
);

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error("usePlayground must be used within PlaygroundProvider");
  }
  return context;
}

export function PlaygroundProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: PlaygroundContextType;
}) {
  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
}
