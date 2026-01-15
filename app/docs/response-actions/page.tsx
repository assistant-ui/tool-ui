import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Response Actions",
  description: "Add contextual actions to AI responses",
};

export const revalidate = 3600;

export default function ContextualActionsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
