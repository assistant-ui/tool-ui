import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { CodeBlockPreview } from "../_components/component-previews/code-block-preview";

export const metadata: Metadata = {
  title: "Code Block",
  description: "Display syntax-highlighted code snippets",
};

export default function CodeBlockDocsPage() {
  return (
    <ComponentDocsTabs docs={<Content />} examples={<CodeBlockPreview />} />
  );
}
