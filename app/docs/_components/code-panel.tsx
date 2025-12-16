"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

interface CodePanelProps {
  code: string;
}

export function CodePanel({ code }: CodePanelProps) {
  return (
    <div className="code-panel-fullbleed scrollbar-subtle flex min-h-0 flex-1 flex-col overflow-auto">
      <DynamicCodeBlock lang="tsx" code={code} />
    </div>
  );
}
