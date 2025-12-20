import type { ConsoleEntry } from "@/app/workbench/lib/types";
import { CornerDownRight } from "lucide-react";
import { ExpandableRow } from "./expandable-row";

import { ExpandedContent } from "./expanded-content";
import { ResultPreview } from "./json-preview";

interface ResponseRowProps {
  response: ConsoleEntry;
  isExpanded: boolean;
  onToggle: () => void;
  standalone?: boolean;
}

export function ResponseRow({
  response,
  isExpanded,
  onToggle,
  standalone = false,
}: ResponseRowProps) {
  const hasDetails = response.result !== undefined;

  return (
    <div className="group/response">
      <ExpandableRow
        onClick={onToggle}
        disabled={!hasDetails}
        className={standalone ? "py-1 pr-2 pl-16" : "py-1 pr-2"}
      >
        <CornerDownRight className="size-3 shrink-0" />
        <span className="text-muted-foreground truncate text-xs">Response</span>
      </ExpandableRow>

      {isExpanded && hasDetails && (
        <ExpandedContent
          className={
            standalone ? "ml-17 pr-2 pb-1 pl-4" : "ml-1 pr-2 pb-1 pl-4"
          }
        >
          <ResultPreview value={response.result} />
        </ExpandedContent>
      )}
    </div>
  );
}
