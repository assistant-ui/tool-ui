import { CopyMarkdownButton } from "./copy-markdown-button";
import { HeaderPreviewTabs } from "./header-preview-tabs";
import { getMdxAsMarkdown } from "./mdx-to-markdown";
import { isComponentId } from "@/lib/docs/component-ids";

type DocsHeaderProps = {
  title: string;
  description?: string;
  mdxPath?: string;
};

export function DocsHeader({ title, description, mdxPath }: DocsHeaderProps) {
  const markdown = mdxPath ? getMdxAsMarkdown(mdxPath) : undefined;
  const componentIdMatch = mdxPath?.match(/^app\/docs\/([^/]+)\/content\.mdx$/);
  const parsedComponentId = componentIdMatch?.[1];
  const componentId =
    parsedComponentId && isComponentId(parsedComponentId)
      ? parsedComponentId
      : null;

  return (
    <div className="mb-12 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        {markdown && <CopyMarkdownButton markdown={markdown} />}
      </div>
      {description && (
        <div className="text-muted-foreground text-lg">{description}</div>
      )}
      {componentId && <HeaderPreviewTabs componentId={componentId} />}
    </div>
  );
}
