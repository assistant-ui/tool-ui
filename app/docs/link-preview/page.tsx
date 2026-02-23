import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Link Preview",
  description: "Rich link previews with OG data",
};

export const revalidate = 3600;

export default function LinkPreviewDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="link-preview" />;
}
