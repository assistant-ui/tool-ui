"use client";

import {
  ToolUIErrorBoundary,
  type ToolUIErrorBoundaryProps,
} from "../shared";

export function ProgressTrackerErrorBoundary(
  props: Omit<ToolUIErrorBoundaryProps, "componentName">,
) {
  const { children, ...rest } = props;
  return (
    <ToolUIErrorBoundary componentName="ProgressTracker" {...rest}>
      {children}
    </ToolUIErrorBoundary>
  );
}
