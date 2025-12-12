"use client";

import * as React from "react";
import {
  ToolUIErrorBoundary,
  type ToolUIErrorBoundaryProps,
} from "../shared";

export function XPostErrorBoundary(
  props: Omit<ToolUIErrorBoundaryProps, "componentName">,
) {
  const { children, ...rest } = props;
  return (
    <ToolUIErrorBoundary componentName="XPost" {...rest}>
      {children}
    </ToolUIErrorBoundary>
  );
}

