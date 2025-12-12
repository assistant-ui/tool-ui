"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { Terminal } from "@/components/tool-ui/terminal";
import { TerminalPresetName, terminalPresets } from "@/lib/presets/terminal";

export function TerminalPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "success";
  const initialPreset: TerminalPresetName =
    presetParam && presetParam in terminalPresets
      ? (presetParam as TerminalPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<TerminalPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in terminalPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as TerminalPresetName);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentData = terminalPresets[currentPreset].data;

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as TerminalPresetName;
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
          componentId="terminal"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(isLoadingState) => (
        <Terminal
          {...currentData}
          id="terminal-preview"
          onResponseAction={handleResponseAction}
          isLoading={isLoadingState}
        />
      )}
      renderCodePanel={() => (
        <CodePanel
          className="h-full w-full"
          componentId="terminal"
          terminalPreset={currentPreset}
          mode="plain"
        />
      )}
    />
  );
}
