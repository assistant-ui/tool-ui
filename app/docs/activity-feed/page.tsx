import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { ComponentPreview } from "../_components/component-preview";

export const metadata: Metadata = {
  title: "Activity Feed",
  description: "Live chronological stream of events with size-aware layout",
  robots: "noindex", // Unlisted for now
};

export const revalidate = 3600;

export default function ActivityFeedDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<ComponentPreview componentId="activity-feed" />}
    />
  );
}
