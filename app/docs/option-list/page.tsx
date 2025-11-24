import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { OptionListPreview } from "../[component]/previews/option-list-preview";

export default function OptionListDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<OptionListPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
