"use client";

import * as React from "react";
import {
  ToolUIErrorBoundary,
  type ToolUIErrorBoundaryProps,
} from "../shared";

export function ChartErrorBoundary(
  props: Omit<ToolUIErrorBoundaryProps, "componentName">,
) {
  const { children, ...rest } = props;
  return (
    <ToolUIErrorBoundary componentName="Chart" {...rest}>
      {children}
    </ToolUIErrorBoundary>
  );
}

