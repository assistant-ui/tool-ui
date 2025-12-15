import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { CodeBlockPreview } from "../[component]/previews/code-block-preview";

export const metadata: Metadata = {
  title: "Code Block",
  description: "Display syntax-highlighted code snippets",
};

export default function CodeBlockDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<CodeBlockPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
