"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import {
  DecisionPrompt,
  type SerializableDecisionPrompt,
} from "@/components/decision-prompt";

export interface RenderDecisionPromptOutput {
  decision: SerializableDecisionPrompt;
}

/**
 * Tool UI that renders a DecisionPrompt from a serializable payload.
 */
export const RenderDecisionPromptUI = makeAssistantToolUI<
  // input type (unused for rendering-only)
  Record<string, unknown>,
  RenderDecisionPromptOutput
>({
  toolName: "render_decision_prompt",
  render: ({ result, status }) => {
    if (status.type === "running") {
      return (
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Loading prompt…</p>
        </div>
      );
    }

    if (!result) return null;

    return (
      <div className="w-full max-w-[420px] min-w-0">
        <DecisionPrompt {...result.decision} />
      </div>
    );
  },
});
