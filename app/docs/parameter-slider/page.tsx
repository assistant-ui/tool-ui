import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Parameter Slider",
  description: "Numeric parameter adjustment controls",
};

export const revalidate = 3600;

export default function ParameterSliderDocsPage() {
  return (
    <ComponentDocsTabs docs={<Content />} componentId="parameter-slider" />
  );
}
