import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Item Carousel",
  description: "Display items in a horizontal scrollable carousel",
};

export const revalidate = 3600;

export default function ItemCarouselDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="item-carousel" />;
}
