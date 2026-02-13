import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Actions",
  description:
    "Learn the Tool UI action model: sibling LocalActions and DecisionActions for display-first components, plus dedicated action props for action-centric components.",
};

export const revalidate = 3600;

export default function ActionsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
