import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Video",
  description: "Video playback with controls and poster",
};

export const revalidate = 3600;

export default function VideoDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="video" />;
}
