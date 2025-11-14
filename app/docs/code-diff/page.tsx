import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { CodeDiffPreview } from "../[component]/previews/code-diff-preview";

export default function CodeDiffDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<CodeDiffPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
