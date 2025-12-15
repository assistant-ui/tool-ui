import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { OptionListPreview } from "../[component]/previews/option-list-preview";

export const metadata: Metadata = {
  title: "Option List",
  description: "Let users select from multiple choices",
};

export default function OptionListDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<OptionListPreview />}
      defaultTab="docs"
    />
  );
}
