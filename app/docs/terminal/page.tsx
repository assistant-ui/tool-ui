import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { TerminalPreview } from "../[component]/previews/terminal-preview";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Show command-line output and logs",
};

export default function TerminalDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<TerminalPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
