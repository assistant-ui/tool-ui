"use client";

import * as React from "react";
import {
  ToolUIErrorBoundary,
  type ToolUIErrorBoundaryProps,
} from "../shared";

export function TerminalErrorBoundary(
  props: Omit<ToolUIErrorBoundaryProps, "componentName">,
) {
  const { children, ...rest } = props;
  return (
    <ToolUIErrorBoundary componentName="Terminal" {...rest}>
      {children}
    </ToolUIErrorBoundary>
  );
}

