import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Order Summary",
  description:
    "Display agent-suggested purchases with itemized pricing for user confirmation",
};

export const revalidate = 3600;

export default function OrderSummaryDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="order-summary" />;
}
