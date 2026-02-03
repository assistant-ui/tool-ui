import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { ComponentPreview } from "../_components/component-preview";

export const metadata: Metadata = {
  title: "Time Series",
  description: "Size-aware time-series trend visualization",
  robots: "noindex",
};

export const revalidate = 3600;

export default function TimeSeriesDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<ComponentPreview componentId="time-series" />}
    />
  );
}
