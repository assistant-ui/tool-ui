import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { ComponentPreview } from "../_components/component-preview";

export const metadata: Metadata = {
  title: "Order Summary",
  description:
    "Display agent-suggested purchases with itemized pricing for user confirmation",
};

export default function OrderSummaryDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<ComponentPreview componentId="order-summary" />}
    />
  );
}
