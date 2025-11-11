import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { DecisionPromptPreview } from "../[component]/previews/decision-prompt-preview";

export default function DecisionPromptDocsPage() {
  return (
    <ComponentDocsExamples
      defaultTab="examples"
      docs={<Content />}
      examples={<DecisionPromptPreview withContainer={false} />}
    />
  );
}

