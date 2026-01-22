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
import type { ConditionOverrides } from "../../weather-compositor/presets";
import { useCodeGen } from "../hooks/use-code-gen";

interface ExportPanelProps {
  overrides: Partial<Record<WeatherCondition, ConditionOverrides>>;
  signedOff: Set<WeatherCondition>;
}

export function ExportPanel({ overrides, signedOff }: ExportPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const { copyToClipboard, downloadFile } = useCodeGen(overrides, signedOff);

  const handleCopy = async (
    format: "json-overrides" | "json-full" | "typescript"
  ) => {
    await copyToClipboard({ format });
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (
    format: "json-overrides" | "json-full" | "typescript"
  ) => {
    downloadFile({ format, includeMetadata: format === "json-full" });
  };

  const overrideCount = Object.keys(overrides).length;

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
