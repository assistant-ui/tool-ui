"use client";

import { useCallback, useRef, useState } from "react";
import { ComponentPreviewShell } from "./component-preview-shell";
import { PresetSelector } from "./preset-selector";
import { CodePanel } from "./code-panel";
import { type ComponentId, getPreviewConfig, type PreviewState } from "@/lib/docs/preview-config";
import { usePresetParam } from "@/hooks/use-preset-param";

interface ComponentPreviewProps {
  componentId: ComponentId;
}

export function ComponentPreview({ componentId }: ComponentPreviewProps) {
  const config = getPreviewConfig(componentId);

  const { currentPreset, setPreset } = usePresetParam({
    presets: config.presets,
    defaultPreset: config.defaultPreset,
  });

  const [state, setState] = useState<PreviewState>({});
  const prevPresetRef = useRef(currentPreset);

  if (prevPresetRef.current !== currentPreset) {
    prevPresetRef.current = currentPreset;
    setState({});
  }

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      setPreset(preset as string);
      setState({});
    },
    [setPreset],
  );

  const handleSetState = useCallback((newState: Partial<PreviewState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  const preset = config.presets[currentPreset];
  const code = preset.generateExampleCode(preset.data);

  const previewContent = config.renderComponent({
    data: preset.data,
    presetName: currentPreset,
    state,
    setState: handleSetState,
  });

  const wrappedPreview = config.wrapper ? (
    <config.wrapper>{previewContent}</config.wrapper>
  ) : (
    previewContent
  );

  return (
    <ComponentPreviewShell
      sidebar={
        <PresetSelector
          componentId={componentId}
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      preview={wrappedPreview}
      codePanel={<CodePanel code={code} />}
      code={code}
    />
  );
}
