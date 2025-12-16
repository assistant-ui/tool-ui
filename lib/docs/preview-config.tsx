"use client";

import type { ComponentType, ReactNode } from "react";
import type { PresetWithCodeGen } from "@/lib/presets/types";

import { Chart } from "@/components/tool-ui/chart";
import { CodeBlock } from "@/components/tool-ui/code-block";
import { DataTable } from "@/components/tool-ui/data-table";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import { MediaCard } from "@/components/tool-ui/media-card";
import { OptionList } from "@/components/tool-ui/option-list";
import { Plan } from "@/components/tool-ui/plan";
import { Terminal } from "@/components/tool-ui/terminal";

import { chartPresets, type ChartPresetName } from "@/lib/presets/chart";
import { codeBlockPresets, type CodeBlockPresetName } from "@/lib/presets/code-block";
import { dataTablePresets, type DataTablePresetName, type SortState } from "@/lib/presets/data-table";
import { itemCarouselPresets, type ItemCarouselPresetName } from "@/lib/presets/item-carousel";
import { mediaCardPresets, type MediaCardPresetName } from "@/lib/presets/media-card";
import { optionListPresets, type OptionListPresetName } from "@/lib/presets/option-list";
import { planPresets, type PlanPresetName } from "@/lib/presets/plan";
import { terminalPresets, type TerminalPresetName } from "@/lib/presets/terminal";

export type ComponentId =
  | "chart"
  | "code-block"
  | "data-table"
  | "item-carousel"
  | "media-card"
  | "option-list"
  | "plan"
  | "terminal";

export interface PreviewConfig<TData, TPresetName extends string> {
  presets: Record<TPresetName, PresetWithCodeGen<TData>>;
  defaultPreset: TPresetName;
  renderComponent: (props: {
    data: TData;
    presetName: TPresetName;
    state: PreviewState;
    setState: (state: Partial<PreviewState>) => void;
  }) => ReactNode;
  wrapper?: ComponentType<{ children: ReactNode }>;
}

export interface PreviewState {
  sort?: SortState;
  selection?: string[] | string | null;
}

function MaxWidthWrapper({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-md">{children}</div>;
}

export const previewConfigs: Record<ComponentId, PreviewConfig<unknown, string>> = {
  chart: {
    presets: chartPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "revenue" satisfies ChartPresetName,
    renderComponent: ({ data, presetName }) => {
      const chartData = data as Omit<Parameters<typeof Chart>[0], "id">;
      return <Chart id={`chart-${presetName}`} {...chartData} />;
    },
  },
  "code-block": {
    presets: codeBlockPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "typescript" satisfies CodeBlockPresetName,
    renderComponent: ({ data }) => <CodeBlock {...(data as Parameters<typeof CodeBlock>[0])} />,
  },
  "data-table": {
    presets: dataTablePresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "stocks" satisfies DataTablePresetName,
    renderComponent: ({ data, state, setState }) => {
      const tableData = data as Parameters<typeof DataTable>[0];
      return (
        <DataTable
          {...tableData}
          sort={state.sort as Parameters<typeof DataTable>[0]["sort"]}
          onSortChange={(sort) => setState({ sort })}
          onResponseAction={(actionId) => console.log("Response action:", actionId)}
        />
      );
    },
  },
  "media-card": {
    presets: mediaCardPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "image" satisfies MediaCardPresetName,
    renderComponent: ({ data }) => {
      const { card, responseActions } = data as { card: Parameters<typeof MediaCard>[0]; responseActions?: unknown[] };
      return (
        <MediaCard
          {...card}
          responseActions={responseActions as Parameters<typeof MediaCard>[0]["responseActions"]}
          onResponseAction={(actionId) => console.log("Response action:", actionId)}
        />
      );
    },
  },
  "option-list": {
    presets: optionListPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "export" satisfies OptionListPresetName,
    wrapper: MaxWidthWrapper,
    renderComponent: ({ data, state, setState }) => {
      const listData = data as Parameters<typeof OptionList>[0];
      return (
        <OptionList
          {...listData}
          id="option-list-preview"
          value={state.selection}
          onChange={(selection) => setState({ selection })}
          onConfirm={(sel) => {
            console.log("OptionList confirmed:", sel);
            alert(`Selection confirmed: ${JSON.stringify(sel)}`);
          }}
        />
      );
    },
  },
  plan: {
    presets: planPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "simple" satisfies PlanPresetName,
    renderComponent: ({ data }) => <Plan {...(data as Parameters<typeof Plan>[0])} />,
  },
  "item-carousel": {
    presets: itemCarouselPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "recommendations" satisfies ItemCarouselPresetName,
    renderComponent: ({ data }) => (
      <ItemCarousel
        {...(data as Parameters<typeof ItemCarousel>[0])}
        onItemClick={(itemId) => console.log("Item clicked:", itemId)}
        onItemAction={(itemId, actionId) => console.log("Item action:", itemId, actionId)}
      />
    ),
  },
  terminal: {
    presets: terminalPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "success" satisfies TerminalPresetName,
    renderComponent: ({ data }) => (
      <Terminal
        {...(data as Parameters<typeof Terminal>[0])}
        id="terminal-preview"
        onResponseAction={(actionId) => console.log("Response action:", actionId)}
      />
    ),
  },
};

export function getPreviewConfig(componentId: ComponentId) {
  return previewConfigs[componentId];
}
