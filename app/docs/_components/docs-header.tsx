import { CopyMarkdownButton } from "./copy-markdown-button";
import { HeaderPreviewTabs } from "./header-preview-tabs";
import { getMdxAsMarkdown } from "./mdx-to-markdown";
import { getPreviewConfig, type ComponentId } from "@/lib/docs/preview-config";

type DocsHeaderProps = {
  title: string;
  description?: string;
  mdxPath?: string;
};

export function DocsHeader({ title, description, mdxPath }: DocsHeaderProps) {
  const markdown = mdxPath ? getMdxAsMarkdown(mdxPath) : undefined;
  const componentIdMatch = mdxPath?.match(/^app\/docs\/([^/]+)\/content\.mdx$/);
  const parsedComponentId = componentIdMatch?.[1];
  const componentId = (() => {
    if (!parsedComponentId) {
      return null;
    }

    const candidateId = parsedComponentId as ComponentId;
    return getPreviewConfig(candidateId) ? candidateId : null;
  })();

  return (
    <div className="mb-12 flex flex-col gap-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between md:gap-3">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        {markdown && (
          <div className="sm:mt-1">
            <CopyMarkdownButton markdown={markdown} />
          </div>
        )}
      </div>
      {description && (
        <div className="text-muted-foreground text-lg">{description}</div>
      )}
      {componentId && <HeaderPreviewTabs componentId={componentId} />}
    </div>
  );
}
