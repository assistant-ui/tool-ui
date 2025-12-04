import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { TerminalPreview } from "../[component]/previews/terminal-preview";

export default function TerminalDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<TerminalPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
