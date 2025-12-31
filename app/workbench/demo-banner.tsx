"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

const NPX_COMMAND = "npx @assistant-ui/create-chatgpt-app";

export function DemoBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(NPX_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-8 shrink-0 items-center justify-center gap-1.5 bg-emerald-800 px-4 text-xs text-white">
      <span>This is an interactive demo of the workbench feature.</span>
      <span className="hidden sm:inline">
        Try it with{" "}
        <button
          type="button"
          onClick={handleCopy}
          className="ml-0.5 inline-flex cursor-pointer items-center gap-2.5 rounded bg-emerald-950 px-1.5 py-0.5 font-mono hover:bg-emerald-950 active:bg-emerald-950/70"
        >
          <span>{NPX_COMMAND}</span>
          {copied ? (
            <CheckIcon className="size-3 opacity-80" />
          ) : (
            <CopyIcon className="size-3 opacity-80" />
          )}
        </button>
      </span>
      <span className="text-emerald-200">·</span>
      <a
        href="https://github.com/assistant-ui/tool-ui"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-emerald-400 underline-offset-2 transition-colors hover:text-emerald-100"
      >
        GitHub
      </a>
    </div>
  );
}
