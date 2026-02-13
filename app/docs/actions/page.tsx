import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Actions",
  description: "Action model basics.",
};

export const revalidate = 3600;

export default function ActionsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
