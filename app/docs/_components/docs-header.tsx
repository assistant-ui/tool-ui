import { CopyMarkdownButton } from "./copy-markdown-button";
import { HeaderPreviewTabs } from "./header-preview-tabs";
import { getMdxAsMarkdown } from "./mdx-to-markdown";
import type { ComponentId } from "@/lib/docs/preview-config";

type DocsHeaderProps = {
  title: string;
  description?: string;
  mdxPath?: string;
};

export function DocsHeader({ title, description, mdxPath }: DocsHeaderProps) {
  const markdown = mdxPath ? getMdxAsMarkdown(mdxPath) : undefined;
  const componentIdMatch = mdxPath?.match(/^app\/docs\/([^/]+)\/content\.mdx$/);
  const parsedComponentId = componentIdMatch?.[1];
  const previewSupportedIds = new Set<ComponentId>([
    "approval-card",
    "audio",
    "chart",
    "citation",
    "code-block",
    "data-table",
    "image",
    "image-gallery",
    "item-carousel",
    "link-preview",
    "message-draft",
    "option-list",
    "order-summary",
    "parameter-slider",
    "plan",
    "preferences-panel",
    "progress-tracker",
    "question-flow",
    "stats-display",
    "terminal",
    "video",
    "weather-widget",
  ]);
  const componentId =
    parsedComponentId && previewSupportedIds.has(parsedComponentId as ComponentId)
      ? (parsedComponentId as ComponentId)
      : null;

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
