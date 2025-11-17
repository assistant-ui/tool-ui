import { notFound } from "next/navigation";
import { getComponentById } from "@/lib/docs/component-registry";
import { DataTablePreview } from "./previews/data-table-preview";
import { SocialPostPreview } from "./previews/social-post-preview";
import { MediaCardPreview } from "./previews/media-card-preview";
import { DecisionPromptPreview } from "./previews/decision-prompt-preview";

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;
  const resolved = getComponentById(component);
  if (!resolved) {
    notFound();
  }

  // Route to the appropriate preview component
  switch (component) {
    case "data-table":
      return <DataTablePreview />;
    case "social-post":
      return <SocialPostPreview />;
    case "media-card":
      return <MediaCardPreview />;
    case "decision-prompt":
      return <DecisionPromptPreview />;
    default:
      notFound();
  }
}
