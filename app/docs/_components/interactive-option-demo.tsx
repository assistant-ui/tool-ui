"use client";

import { useCallback, useState } from "react";
import { RotateCcw } from "lucide-react";
import { MockThread, MockMessage } from "./mock-thread";
import { OptionList } from "@/components/tool-ui/option-list";
import { cn, Button } from "@/components/tool-ui/option-list/_adapter";

const OPTIONS = [
  {
    id: "postgres",
    label: "PostgreSQL",
    description: "Best for relational data with complex queries",
  },
  {
    id: "sqlite",
    label: "SQLite",
    description: "Simple, embedded, great for single-server apps",
  },
  {
    id: "dynamo",
    label: "DynamoDB",
    description: "Fully managed NoSQL, scales automatically",
  },
];

const FOLLOW_UP: Record<string, string> = {
  postgres:
    "Good choice. PostgreSQL gives you strong typing, JSON support, and a mature ecosystem. Want me to set up the schema?",
  sqlite:
    "Nice pick. SQLite keeps things simple — no server to manage, and it's fast for read-heavy workloads. Want me to set up the database file?",
  dynamo:
    "Solid choice. DynamoDB handles scale automatically with single-digit-millisecond reads. Want me to set up the table definitions?",
};

export function InteractiveOptionDemo() {
  const [choice, setChoice] = useState<string | null>(null);

  const handleAction = useCallback(
    (actionId: string, selection: string | string[] | null) => {
      if (actionId === "confirm" && typeof selection === "string") {
        setChoice(selection);
      }
    },
    [],
  );

  const handleReset = useCallback(() => {
    setChoice(null);
  }, []);

  return (
    <div>
      <MockThread caption="Click an option and confirm — then reset to try again">
        <MockMessage role="user">
          Help me pick a database for the new project
        </MockMessage>
        <MockMessage role="assistant">
          <span className="text-foreground text-sm">
            {"Based on your requirements, here are some options:"}
          </span>
          <div className="mt-3">
            <OptionList
              id="overview-demo-db-picker"
              selectionMode="single"
              options={OPTIONS}
              choice={choice ?? undefined}
              onAction={handleAction}
            />
          </div>
        </MockMessage>
        {choice && (
          <MockMessage role="assistant">
            <span className="text-foreground text-sm">
              {FOLLOW_UP[choice] ?? FOLLOW_UP.postgres}
            </span>
          </MockMessage>
        )}
      </MockThread>
      {choice && (
        <div
          className={cn(
            "flex justify-center",
            "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-200",
          )}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="bg-background gap-1.5 rounded-full border shadow-sm"
          >
            <RotateCcw className="size-3" />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
