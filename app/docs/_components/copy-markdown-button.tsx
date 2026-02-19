"use client";

import type { MouseEventHandler } from "react";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Button } from "@/components/ui/button";
import { Check, Copy as CopyIcon } from "lucide-react";
import { analytics } from "@/lib/analytics";

type CopyMarkdownButtonProps = {
  markdown: string;
};

export function CopyMarkdownButton({ markdown }: CopyMarkdownButtonProps) {
  const [checked, copyMarkdown] = useCopyButton(async () => {
    await navigator.clipboard.writeText(markdown);
  });

  const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    analytics.code.blockCopied("markdown", "docs_header");
    copyMarkdown(event);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} aria-label="Copy page" className="gap-2">
      {checked ? <Check className="size-4" /> : <CopyIcon className="size-4" />}
      {checked ? "Copied" : "Copy Page"}
    </Button>
  );
}
