"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileCode, Check } from "lucide-react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type { CheckpointOverrides } from "../../weather-compositor/presets";
import { useCodeGen } from "../hooks/use-code-gen";

interface ExportPanelProps {
  checkpointOverrides: Partial<Record<WeatherCondition, CheckpointOverrides>>;
  signedOff: Set<WeatherCondition>;
}

export function ExportPanel({ checkpointOverrides, signedOff }: ExportPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const { copyToClipboard, downloadFile } = useCodeGen(checkpointOverrides, signedOff);

  const handleCopy = async (
    format: "json-overrides" | "json-full" | "typescript" | "typescript-tool-ui"
  ) => {
    setCopyError(null);
    const ok = await copyToClipboard({ format, includeMetadata: format === "json-full" });
    if (!ok) {
      setCopyError("Copy blocked by the browser. Downloaded instead.");
      downloadFile({ format, includeMetadata: format === "json-full" });
      setTimeout(() => setCopyError(null), 4000);
      return;
    }
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (
    format: "json-overrides" | "json-full" | "typescript" | "typescript-tool-ui"
  ) => {
    downloadFile({ format, includeMetadata: format === "json-full" });
  };

  const overrideCount = Object.keys(checkpointOverrides).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          Export
          {overrideCount > 0 && (
            <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs">
              {overrideCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Copy to Clipboard</DropdownMenuLabel>
        {copyError && (
          <DropdownMenuItem disabled className="opacity-100 text-red-400">
            {copyError}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleCopy("json-overrides")}>
          <FileJson className="mr-2 size-4" />
          <span className="flex-1">JSON (overrides only)</span>
          {copied === "json-overrides" && <Check className="size-4 text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopy("json-full")}>
          <FileJson className="mr-2 size-4" />
          <span className="flex-1">JSON (with metadata)</span>
          {copied === "json-full" && <Check className="size-4 text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopy("typescript")}>
          <FileCode className="mr-2 size-4" />
          <span className="flex-1">TypeScript</span>
          {copied === "typescript" && <Check className="size-4 text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopy("typescript-tool-ui")}>
          <FileCode className="mr-2 size-4" />
          <span className="flex-1">TypeScript (Tool UI)</span>
          {copied === "typescript-tool-ui" && <Check className="size-4 text-emerald-400" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Download File</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleDownload("json-overrides")}>
          <Download className="mr-2 size-4" />
          weather-tuning-export.json
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("typescript")}>
          <Download className="mr-2 size-4" />
          tuned-overrides.ts
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("typescript-tool-ui")}>
          <Download className="mr-2 size-4" />
          tuned-presets.ts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
