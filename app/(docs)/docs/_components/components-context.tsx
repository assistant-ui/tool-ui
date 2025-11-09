"use client";

import { createContext, useContext, ReactNode } from "react";
import { ViewportSize } from "@/components/viewport-controls";

interface ComponentsContextType {
  viewport: ViewportSize;
  setViewport: (viewport: ViewportSize) => void;
}

const ComponentsContext = createContext<ComponentsContextType | undefined>(
  undefined,
);

export function useComponents() {
  const context = useContext(ComponentsContext);
  if (!context) {
    throw new Error("useComponents must be used within ComponentsProvider");
  }
  return context;
}

export function ComponentsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ComponentsContextType;
}) {
  return (
    <ComponentsContext.Provider value={value}>
      {children}
    </ComponentsContext.Provider>
  );
}
