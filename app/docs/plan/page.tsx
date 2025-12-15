import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { PlanPreview } from "../[component]/previews/plan-preview";

export const metadata: Metadata = {
  title: "Plan",
  description: "Display step-by-step task workflows",
};

export default function PlanDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<PlanPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
