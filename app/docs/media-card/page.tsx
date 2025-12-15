import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { MediaCardPreview } from "../[component]/previews/media-card-preview";

export const metadata: Metadata = {
  title: "Media Card",
  description: "Showcase images and media content",
};

export default function MediaCardDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<MediaCardPreview />}
      defaultTab="docs"
    />
  );
}
