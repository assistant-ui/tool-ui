import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Receipts",
  description: "Confirm what happened after a user decision",
};

export const revalidate = 3600;

export default function ReceiptsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
