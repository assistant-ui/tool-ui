"use client";

import { ReactNode, useMemo, useState } from "react";
import { ComponentsProvider } from "./components-context";
import { ViewportSize } from "@/components/viewport-controls";

interface ComponentsLayoutClientProps {
  children: ReactNode;
}

export function ComponentsLayoutClient({
  children,
}: ComponentsLayoutClientProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  const value = useMemo(
    () => ({
      viewport,
      setViewport,
    }),
    [viewport],
  );

  return <ComponentsProvider value={value}>{children}</ComponentsProvider>;
}
