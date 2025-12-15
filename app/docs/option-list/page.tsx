import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { OptionListPreview } from "../[component]/previews/option-list-preview";

export const metadata: Metadata = {
  title: "Option List",
  description: "Let users select from multiple choices",
};

export default function OptionListDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<OptionListPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
