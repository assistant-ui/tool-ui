import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { DataTablePreview } from "../_components/component-previews/data-table-preview";

export const metadata: Metadata = {
  title: "Data Table",
  description: "Present structured data in sortable tables",
};

export default function DataTableDocsPage() {
  return (
    <ComponentDocsTabs docs={<Content />} examples={<DataTablePreview />} />
  );
}
