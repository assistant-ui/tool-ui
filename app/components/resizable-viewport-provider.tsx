"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { ResizableViewportSize } from "@/app/components/resizable-viewport-controls";

type ResizableViewportContextValue = {
  viewport: ResizableViewportSize;
  setViewport: (viewport: ResizableViewportSize) => void;
};

const ResizableViewportContext = createContext<ResizableViewportContextValue | undefined>(
  undefined,
);

type ResizableViewportProviderProps = {
  children: ReactNode;
  initialViewport?: ResizableViewportSize;
};

export function ResizableViewportProvider({
  children,
  initialViewport = "desktop",
}: ResizableViewportProviderProps) {
  const [viewport, setViewport] = useState<ResizableViewportSize>(initialViewport);

  const value = useMemo(
    () => ({
      viewport,
      setViewport,
    }),
    [viewport],
  );

  return (
    <ResizableViewportContext.Provider value={value}>
      {children}
    </ResizableViewportContext.Provider>
  );
}

export function useResizableViewport() {
  const context = useContext(ResizableViewportContext);
  if (!context) {
    throw new Error("useResizableViewport must be used within a ResizableViewportProvider");
  }
  return context;
}
