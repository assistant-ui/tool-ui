import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Quick Start",
  description: "Get started with Tool UI in minutes",
};

export default function QuickStartPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
