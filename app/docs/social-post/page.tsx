import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { SocialPostPreview } from "../[component]/previews/social-post-preview";

export default function SocialPostDocsPage() {
  return (
    <ComponentDocsExamples
      defaultTab="examples"
      docs={<Content />}
      examples={<SocialPostPreview withContainer={false} />}
    />
  );
}

