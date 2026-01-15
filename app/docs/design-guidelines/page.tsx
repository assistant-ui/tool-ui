import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Design Guidelines",
  description: "Design principles and patterns for Tool UI components",
};

export const revalidate = 3600;

export default function DesignGuidelinesPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
