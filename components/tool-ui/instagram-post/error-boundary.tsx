"use client";

import * as React from "react";
import {
  ToolUIErrorBoundary,
  type ToolUIErrorBoundaryProps,
} from "../shared";

export function InstagramPostErrorBoundary(
  props: Omit<ToolUIErrorBoundaryProps, "componentName">,
) {
  const { children, ...rest } = props;
  return (
    <ToolUIErrorBoundary componentName="InstagramPost" {...rest}>
      {children}
    </ToolUIErrorBoundary>
  );
}

