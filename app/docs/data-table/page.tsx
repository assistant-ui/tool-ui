import Content from "./content.mdx";
import { ComponentDocsExamples } from "../_components/component-docs-examples";
import { DataTablePreview } from "../[component]/previews/data-table-preview";

export default function DataTableDocsPage() {
  return (
    <ComponentDocsExamples
      docs={<Content />}
      examples={<DataTablePreview withContainer={false} />}
    />
  );
}
