import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { ComponentPreview } from "../_components/component-preview";

export const metadata: Metadata = {
  title: "Code Block",
  description: "Display syntax-highlighted code snippets",
};

export const revalidate = 3600;

export default function CodeBlockDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<ComponentPreview componentId="code-block" />}
    />
  );
}
