import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { PlanPreview } from "../[component]/previews/plan-preview";

export default function PlanDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<PlanPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
