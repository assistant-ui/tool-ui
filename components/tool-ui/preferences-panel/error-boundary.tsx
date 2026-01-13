"use client";

import {
  ToolUIErrorBoundary,
  type ToolUIErrorBoundaryProps,
} from "../shared";

export function PreferencesPanelErrorBoundary(
  props: Omit<ToolUIErrorBoundaryProps, "componentName">,
) {
  const { children, ...rest } = props;
  return (
    <ToolUIErrorBoundary componentName="PreferencesPanel" {...rest}>
      {children}
    </ToolUIErrorBoundary>
  );
}
