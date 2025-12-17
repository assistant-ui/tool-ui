import { CopyMarkdownButton } from "./copy-markdown-button";
import { getMdxAsMarkdown } from "./mdx-to-markdown";

type DocsHeaderProps = {
  title: string;
  description?: string;
  mdxPath?: string;
};

export function DocsHeader({ title, description, mdxPath }: DocsHeaderProps) {
  const markdown = mdxPath ? getMdxAsMarkdown(mdxPath) : undefined;

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
    </div>
  );
}
