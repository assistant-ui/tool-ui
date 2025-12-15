import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Advanced",
  description: "Advanced configuration and usage patterns",
};

export default function AdvancedDocsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
