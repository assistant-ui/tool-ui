import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { SocialPostPreview } from "../[component]/previews/social-post-preview";

export const metadata: Metadata = {
  title: "Social Posts",
  description: "Render social media content previews",
};

export default function SocialPostDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<SocialPostPreview />}
      defaultTab="docs"
    />
  );
}
