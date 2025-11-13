import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { MediaCardPreview } from "../[component]/previews/media-card-preview";

export default function MediaCardDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<MediaCardPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
