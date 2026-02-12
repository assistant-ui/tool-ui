import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Agent Resources",
  description: "Resources for coding agents integrating and maintaining Tool UI",
};

export const revalidate = 3600;

export default function AgentResourcesPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
