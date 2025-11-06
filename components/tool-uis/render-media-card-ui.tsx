"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { MediaCard, type SerializableMediaCard } from "@/components/media-card";

export interface RenderMediaCardOutput {
  card: SerializableMediaCard;
}

/**
 * Tool UI that renders a MediaCard from a serializable payload.
 */
export const RenderMediaCardUI = makeAssistantToolUI<
  // input type (unused for rendering-only)
  Record<string, unknown>,
  RenderMediaCardOutput
>({
  toolName: "render_media_card",
  render: ({ result, status }) => {
    if (status.type === "running") {
      return (
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Preparing media…</p>
        </div>
      );
    }

    if (!result) return null;

    return (
      <div className="w-full min-w-0 flex justify-start">
        <MediaCard {...result.card} maxWidth="420px" />
      </div>
    );
  },
});
