"use client";

import * as React from "react";

interface CodeDiffErrorBoundaryState {
  hasError: boolean;
}

export class CodeDiffErrorBoundary extends React.Component<
  React.PropsWithChildren,
  CodeDiffErrorBoundaryState
> {
  state: CodeDiffErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CodeDiffErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error("CodeDiffErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-destructive border-destructive/50 bg-destructive/10 rounded-md border px-3 py-2 text-sm">
          Failed to render code diff.
        </div>
      );
    }

    return this.props.children;
  }
}
