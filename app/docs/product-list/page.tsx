import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { ProductListPreview } from "../[component]/previews/product-list-preview";

export default function ProductListDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<ProductListPreview withContainer={false} />}
      defaultTab="docs"
    />
  );
}
