import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Overview",
  description: "Introduction to Tool UI component library",
};

export const revalidate = 3600;

export default function OverviewPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
