import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Question Flow",
  description: "Multi-step guided questions with branching",
};

export const revalidate = 3600;

export default function QuestionFlowDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="question-flow" />;
}
