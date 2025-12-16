import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { ComponentPreview } from "../_components/component-preview";

export const metadata: Metadata = {
  title: "Product List",
  description: "Display products in a horizontal scrollable carousel",
};

export default function ProductListDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<ComponentPreview componentId="product-list" />}
    />
  );
}
