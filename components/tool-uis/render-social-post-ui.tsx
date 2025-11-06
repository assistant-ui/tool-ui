"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import {
  SocialPost,
  type SerializableSocialPost,
} from "@/components/social-post";

export interface RenderSocialPostOutput {
  post: SerializableSocialPost;
}

/**
 * Tool UI that renders a SocialPost from a serializable payload.
 */
export const RenderSocialPostUI = makeAssistantToolUI<
  // input type (unused for rendering-only)
  Record<string, unknown>,
  RenderSocialPostOutput
>({
  toolName: "render_social_post",
  render: ({ result, status }) => {
    if (status.type === "running") {
      return (
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">Loading post…</p>
        </div>
      );
    }

    if (!result) return null;

    return (
      <div className="w-full min-w-0 flex justify-start">
        <div className="w-full max-w-[600px] min-w-0">
          <SocialPost {...result.post} className="w-full" maxWidth="100%" />
        </div>
      </div>
    );
  },
});
