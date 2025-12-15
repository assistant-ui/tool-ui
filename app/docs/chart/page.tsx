import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { ChartPreview } from "../[component]/previews/chart-preview";

export const metadata: Metadata = {
  title: "Chart",
  description: "Visualize data with interactive charts",
};

export default function ChartDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<ChartPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
