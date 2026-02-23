import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Data Table",
  description: "Present structured data in sortable tables",
};

export const revalidate = 3600;

export default function DataTableDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="data-table" />;
}
