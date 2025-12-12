"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { CodeBlock } from "@/components/tool-ui/code-block";
import { CodeBlockPresetName, codeBlockPresets } from "@/lib/presets/code-block";

export function CodeBlockPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "typescript";
  const initialPreset: CodeBlockPresetName =
    presetParam && presetParam in codeBlockPresets
      ? (presetParam as CodeBlockPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<CodeBlockPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in codeBlockPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as CodeBlockPresetName);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentData = codeBlockPresets[currentPreset].data;

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as CodeBlockPresetName;
      setCurrentPreset(presetName);
      setIsLoading(false);

      const params = new URLSearchParams(searchParams.toString());
      params.set("preset", presetName);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleResponseAction = useCallback(async (actionId: string) => {
    console.log("Response action:", actionId);
  }, []);

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      presetSelector={
        <PresetSelector
          componentId="code-block"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(isLoadingState) => (
        <CodeBlock
          {...currentData}
          id="code-block-preview"
          onResponseAction={handleResponseAction}
          isLoading={isLoadingState}
        />
      )}
      renderCodePanel={() => (
        <CodePanel
          className="h-full w-full"
          componentId="code-block"
          codeBlockPreset={currentPreset}
          mode="plain"
        />
      )}
    />
  );
}
