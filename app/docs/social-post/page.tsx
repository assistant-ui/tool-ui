import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { SocialPostPreview } from "../[component]/previews/social-post-preview";

export const metadata: Metadata = {
  title: "Social Posts",
  description: "Render social media content previews",
};

export default function SocialPostDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<SocialPostPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
