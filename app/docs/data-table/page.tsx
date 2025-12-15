import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { DataTablePreview } from "../[component]/previews/data-table-preview";

export const metadata: Metadata = {
  title: "Data Table",
  description: "Present structured data in sortable tables",
};

export default function DataTableDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<DataTablePreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
