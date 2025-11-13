import { CopyMarkdownButton } from "./copy-markdown-button";

type DocsHeaderProps = {
  title: string;
  showCopyButton?: boolean;
};

export function DocsHeader({ title, showCopyButton = true }: DocsHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      {showCopyButton && (
        <div className="sm:mt-1">
          <CopyMarkdownButton />
        </div>
      )}
    </div>
  );
}
