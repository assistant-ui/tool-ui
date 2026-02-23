import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Progress Tracker",
  description: "Real-time status feedback for multi-step operations",
};

export const revalidate = 3600;

export default function ProgressTrackerDocsPage() {
  return (
    <ComponentDocsTabs docs={<Content />} componentId="progress-tracker" />
  );
}
