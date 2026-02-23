import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Preferences Panel",
  description: "Compact settings panel for user preferences",
};

export const revalidate = 3600;

export default function PreferencesPanelDocsPage() {
  return (
    <ComponentDocsTabs docs={<Content />} componentId="preferences-panel" />
  );
}
