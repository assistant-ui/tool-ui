import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { ChartPreview } from "../[component]/previews/chart-preview";

export const metadata: Metadata = {
  title: "Chart",
  description: "Visualize data with interactive charts",
};

export default function ChartDocsPage() {
  return (
    <ComponentDocsTabs docs={<Content />} examples={<ChartPreview />} />
  );
}
