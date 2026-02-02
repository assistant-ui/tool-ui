import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Activity Feed",
  description: "Live chronological stream of events with size-aware layout",
  robots: "noindex", // Unlisted for now
};

export const revalidate = 3600;

export default function ActivityFeedDocsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
