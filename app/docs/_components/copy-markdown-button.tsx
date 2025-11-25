"use client";

import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Button } from "@/components/ui/button";
import { Check, Copy as CopyIcon } from "lucide-react";

type CopyMarkdownButtonProps = {
  markdown: string;
};

export function CopyMarkdownButton({ markdown }: CopyMarkdownButtonProps) {
  const [checked, onClick] = useCopyButton(async () => {
    await navigator.clipboard.writeText(markdown);
  });

  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} aria-label="Copy page as Markdown" className="gap-2">
      {checked ? <Check className="size-4" /> : <CopyIcon className="size-4" />}
      {checked ? "Copied" : "Copy as Markdown"}
    </Button>
  );
}

