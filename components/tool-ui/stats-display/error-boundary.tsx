"use client";

import {
  ToolUIErrorBoundary,
  type ToolUIErrorBoundaryProps,
} from "../shared";

export function StatsDisplayErrorBoundary(
  props: Omit<ToolUIErrorBoundaryProps, "componentName">,
) {
  const { children, ...rest } = props;
  return (
    <ToolUIErrorBoundary componentName="StatsDisplay" {...rest}>
      {children}
    </ToolUIErrorBoundary>
  );
}
