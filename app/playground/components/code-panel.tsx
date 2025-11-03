"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { DataTableConfig } from "@/lib/sample-data";

interface CodePanelProps {
  config: DataTableConfig;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  isLoading?: boolean;
  emptyMessage?: string;
}

export function CodePanel({
  config,
  sortBy,
  sortDirection,
  isLoading,
  emptyMessage,
}: CodePanelProps) {
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    const props: string[] = [];

    props.push(
      `  columns={${JSON.stringify(config.columns, null, 4).replace(/\n/g, "\n  ")}}`,
    );

    props.push(
      `  data={${JSON.stringify(config.data, null, 4).replace(/\n/g, "\n  ")}}`,
    );

    if (config.actions && config.actions.length > 0) {
      props.push(
        `  actions={${JSON.stringify(config.actions, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    if (config.rowIdKey) {
      props.push(`  rowIdKey="${config.rowIdKey}"`);
    }

    if (sortBy) {
      props.push(`  sortBy="${sortBy}"`);
    }
    if (sortDirection) {
      props.push(`  sortDirection="${sortDirection}"`);
    }

    if (isLoading) {
      props.push(`  isLoading={true}`);
    }

    if (emptyMessage && emptyMessage !== "No data available") {
      props.push(`  emptyMessage="${emptyMessage}"`);
    }

    return `<DataTable\n${props.join("\n")}\n/>`;
  };

  const code = generateCode();

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="shrink-0 border-t bg-muted/50">
      <div className="px-6 py-3">
        <details>
          <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
            <span>Generated Code</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                copyCode();
              }}
              className="h-8"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </summary>
          <div className="mt-3 max-h-64 overflow-auto rounded-md bg-background p-4">
            <pre className="text-xs">
              <code>{code}</code>
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
