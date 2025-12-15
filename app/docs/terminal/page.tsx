import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { TerminalPreview } from "../[component]/previews/terminal-preview";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Show command-line output and logs",
};

export default function TerminalDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<TerminalPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
