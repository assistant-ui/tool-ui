import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Contributing",
  description: "How to contribute to Tool UI",
};

export default function ContributingPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
