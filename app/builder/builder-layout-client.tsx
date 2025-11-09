"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";

type BuilderViewportContextValue = {
  viewport: ViewportSize;
  setViewport: (viewport: ViewportSize) => void;
};

const BuilderViewportContext = createContext<
  BuilderViewportContextValue | undefined
>(undefined);

function useBuilderViewportContext() {
  const context = useContext(BuilderViewportContext);
  if (!context) {
    throw new Error(
      "useBuilderViewportContext must be used within BuilderLayoutClient",
    );
  }
  return context;
}

export function useBuilderViewport() {
  return useBuilderViewportContext();
}

interface BuilderLayoutClientProps {
  children: ReactNode;
}

export function BuilderLayoutClient({ children }: BuilderLayoutClientProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  const value = useMemo(
    () => ({
      viewport,
      setViewport,
    }),
    [viewport],
  );

  return (
    <BuilderViewportContext.Provider value={value}>
      {children}
    </BuilderViewportContext.Provider>
  );
}

export function BuilderHeaderControls() {
  const { viewport, setViewport } = useBuilderViewportContext();

  return (
    <ViewportControls
      viewport={viewport}
      onViewportChange={setViewport}
      showThemeToggle
      showViewportButtons={false}
    />
  );
}
