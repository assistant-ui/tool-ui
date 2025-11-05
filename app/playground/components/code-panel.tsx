"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Code } from "lucide-react";
import { DataTableConfig } from "@/lib/sample-data";

interface CodePanelProps {
  config: DataTableConfig;
  sort?: { by?: string; direction?: "asc" | "desc" };
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function CodePanel({
  config,
  sort,
  isLoading,
  emptyMessage,
  className,
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

    if (config.defaultSort) {
      props.push(
        `  defaultSort={${JSON.stringify(config.defaultSort, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    if (isLoading) {
      props.push(`  isLoading={true}`);
    }

    if (emptyMessage && emptyMessage !== "No data available") {
      props.push(`  emptyMessage="${emptyMessage}"`);
    }

    if (config.maxHeight) {
      props.push(`  maxHeight="${config.maxHeight}"`);
    }

    if (config.locale) {
      props.push(`  locale="${config.locale}"`);
    }

    // Generate sorting guidance only when relying on controlled state
    const sortingComment: string[] = [];
    if (!config.defaultSort && sort?.by && sort?.direction) {
      sortingComment.push(
        `  {/* Sorting: Choose controlled or uncontrolled pattern */}`,
      );
      sortingComment.push(
        `  {/* Option 1 (Uncontrolled): defaultSort={{ by: "${sort.by}", direction: "${sort.direction}" }} */}`,
      );
      sortingComment.push(
        `  {/* Option 2 (Controlled): sort={sort} onSortChange={setSort} */}`,
      );
    }

    const sortingExplanation =
      sortingComment.length > 0 ? `\n${sortingComment.join("\n")}\n` : "";

    const requiresConfirmation = config.actions?.some(
      (action) => action.requiresConfirmation,
    );

    const confirmationHint = requiresConfirmation
      ? `\n// Tip: pair actions that set requiresConfirmation with onBeforeAction to trigger confirms.\n`
      : "";

    return `${sortingExplanation}<DataTable\n${props.join("\n")}\n/>${confirmationHint}`;
  };

  const code = generateCode();

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={className}>
      <div className="px-6 py-3">
        <details>
          <summary className="flex cursor-pointer items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <Code className="h-4 w-4" />
              <span>Generated Code</span>
            </div>
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
          <div className="mt-3 max-h-64 overflow-auto p-4">
            <pre className="text-xs">
              <code>{code}</code>
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
