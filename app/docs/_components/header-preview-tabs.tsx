"use client";

import { useCallback, useState } from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import {
  type ComponentId,
  getPreviewConfig,
  type PreviewState,
} from "@/lib/docs/preview-config";

interface HeaderPreviewTabsProps {
  componentId: ComponentId;
}

const EMPTY_STATE: PreviewState = {};

export function HeaderPreviewTabs({ componentId }: HeaderPreviewTabsProps) {
  const config = getPreviewConfig(componentId);
  if (!config) {
    return null;
  }
  const [state, setState] = useState<PreviewState>(EMPTY_STATE);

  const handleSetState = useCallback((partialState: Partial<PreviewState>) => {
    setState((prev) => ({ ...prev, ...partialState }));
  }, []);

  const preset = config.presets[config.defaultPreset];
  const preview = config.renderComponent({
    data: preset.data,
    presetName: config.defaultPreset,
    state,
    setState: handleSetState,
  });
  const wrappedPreview = config.wrapper ? (
    <config.wrapper>{preview}</config.wrapper>
  ) : (
    preview
  );
  const code = preset.generateExampleCode(preset.data);

  return (
    <div className="not-prose mt-6">
      <Tabs items={["Preview", "Code"]}>
        <Tab value="Preview">
          <div className="header-preview-center flex w-full justify-center">
            {wrappedPreview}
          </div>
        </Tab>
        <Tab value="Code">
          <DynamicCodeBlock lang="tsx" code={code} />
        </Tab>
      </Tabs>
    </div>
  );
}
