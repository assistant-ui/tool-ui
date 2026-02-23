import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Stats Display",
  description: "Display key metrics in a grid",
};

export const revalidate = 3600;

export default function StatsDisplayDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="stats-display" />;
}
