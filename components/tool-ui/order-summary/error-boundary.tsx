"use client";

import * as React from "react";
import { ToolUIErrorBoundary } from "../shared";

export function OrderSummaryErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToolUIErrorBoundary componentName="OrderSummary">
      {children}
    </ToolUIErrorBoundary>
  );
}
