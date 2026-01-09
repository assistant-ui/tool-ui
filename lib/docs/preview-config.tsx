"use client";

import type { ComponentType, ReactNode } from "react";
import type { PresetWithCodeGen } from "@/lib/presets/types";

import { ApprovalCard } from "@/components/tool-ui/approval-card";
import { Chart } from "@/components/tool-ui/chart";
import { Citation, CitationList } from "@/components/tool-ui/citation";
import { CodeBlock } from "@/components/tool-ui/code-block";
import { DataTable } from "@/components/tool-ui/data-table";
import { Image } from "@/components/tool-ui/image";
import { ImageGallery } from "@/components/tool-ui/image-gallery";
import { Video } from "@/components/tool-ui/video";
import { Audio } from "@/components/tool-ui/audio";
import { LinkPreview } from "@/components/tool-ui/link-preview";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import { OptionList } from "@/components/tool-ui/option-list";
import { OrderSummary } from "@/components/tool-ui/order-summary";
import { ParameterSlider } from "@/components/tool-ui/parameter-slider";
import { Plan } from "@/components/tool-ui/plan";
import { Terminal } from "@/components/tool-ui/terminal";

import { approvalCardPresets, type ApprovalCardPresetName } from "@/lib/presets/approval-card";
import { chartPresets, type ChartPresetName } from "@/lib/presets/chart";
import { citationPresets, type CitationPresetName } from "@/lib/presets/citation";
import { codeBlockPresets, type CodeBlockPresetName } from "@/lib/presets/code-block";
import { dataTablePresets, type DataTablePresetName, type SortState } from "@/lib/presets/data-table";
import { imagePresets, type ImagePresetName } from "@/lib/presets/image";
import { imageGalleryPresets, type ImageGalleryPresetName } from "@/lib/presets/image-gallery";
import { videoPresets, type VideoPresetName } from "@/lib/presets/video";
import { audioPresets, type AudioPresetName } from "@/lib/presets/audio";
import { linkPreviewPresets, type LinkPreviewPresetName } from "@/lib/presets/link-preview";
import { itemCarouselPresets, type ItemCarouselPresetName } from "@/lib/presets/item-carousel";
import { optionListPresets, type OptionListPresetName } from "@/lib/presets/option-list";
import { orderSummaryPresets, type OrderSummaryPresetName } from "@/lib/presets/order-summary";
import { parameterSliderPresets, type ParameterSliderPresetName } from "@/lib/presets/parameter-slider";
import { planPresets, type PlanPresetName } from "@/lib/presets/plan";
import { terminalPresets, type TerminalPresetName } from "@/lib/presets/terminal";

export type ComponentId =
  | "approval-card"
  | "chart"
  | "citation"
  | "code-block"
  | "data-table"
  | "image"
  | "image-gallery"
  | "video"
  | "audio"
  | "link-preview"
  | "item-carousel"
  | "option-list"
  | "order-summary"
  | "parameter-slider"
  | "plan"
  | "terminal";

export interface ChatContext {
  userMessage: string;
  preamble?: string;
}

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
  chatContext: ChatContext;
}

export interface PreviewState {
  sort?: SortState;
  selection?: string[] | string | null;
}

function MaxWidthWrapper({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-md">{children}</div>;
}

function MaxWidthSmWrapper({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-sm">{children}</div>;
}

function MaxWidthSmStartWrapper({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-sm">{children}</div>;
}

export const previewConfigs: Record<ComponentId, PreviewConfig<unknown, string>> = {
  "approval-card": {
    presets: approvalCardPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "deploy" satisfies ApprovalCardPresetName,
    wrapper: MaxWidthSmWrapper,
    chatContext: {
      userMessage: "Deploy the latest changes to production",
      preamble: "I'll need your confirmation before proceeding:",
    },
    renderComponent: ({ data }) => {
      const cardData = data as Parameters<typeof ApprovalCard>[0];
      return (
        <ApprovalCard
          {...cardData}
          onConfirm={() => console.log("Approved")}
          onCancel={() => console.log("Denied")}
        />
      );
    },
  },
  chart: {
    presets: chartPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "revenue" satisfies ChartPresetName,
    chatContext: {
      userMessage: "Show me the revenue data for this quarter",
      preamble: "Here's your data visualization:",
    },
    renderComponent: ({ data, presetName }) => {
      const chartData = data as Omit<Parameters<typeof Chart>[0], "id">;
      return <Chart id={`chart-${presetName}`} {...chartData} />;
    },
  },
  citation: {
    presets: citationPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "stacked" satisfies CitationPresetName,
    chatContext: {
      userMessage: "What does the documentation say about this?",
      preamble: "According to the source:",
    },
    renderComponent: ({ data, presetName }) => {
      const { citations, variant, maxVisible, responseActions } = data as {
        citations: Parameters<typeof Citation>[0][];
        variant?: Parameters<typeof Citation>[0]["variant"];
        maxVisible?: number;
        responseActions?: unknown[];
      };

      // Single citation without list
      if (citations.length === 1 && !maxVisible) {
        return (
          <div className="mx-auto w-full max-w-md">
            <Citation
              {...citations[0]}
              variant={variant}
              responseActions={responseActions as Parameters<typeof Citation>[0]["responseActions"]}
              onResponseAction={(actionId) => console.log("Response action:", actionId)}
            />
          </div>
        );
      }

      // Multiple citations or truncated list
      const wrapperClass =
        variant === "inline" ? "mx-auto max-w-xl" : "mx-auto max-w-lg";

      return (
        <div className={wrapperClass}>
          <CitationList
            id={`citation-list-${presetName}`}
            citations={citations}
            variant={variant}
            maxVisible={maxVisible}
          />
        </div>
      );
    },
  },
  "code-block": {
    presets: codeBlockPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "typescript" satisfies CodeBlockPresetName,
    chatContext: {
      userMessage: "Write me a utility function for this",
      preamble: "Here's the code:",
    },
    renderComponent: ({ data }) => <CodeBlock {...(data as Parameters<typeof CodeBlock>[0])} />,
  },
  "data-table": {
    presets: dataTablePresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "stocks" satisfies DataTablePresetName,
    chatContext: {
      userMessage: "Show me the data in a table",
      preamble: "Here's what I found:",
    },
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
  image: {
    presets: imagePresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "with-source" satisfies ImagePresetName,
    wrapper: MaxWidthWrapper,
    chatContext: {
      userMessage: "Generate an image of a sunset over mountains",
      preamble: "Here's what I created:",
    },
    renderComponent: ({ data }) => {
      const { image, responseActions } = data as { image: Parameters<typeof Image>[0]; responseActions?: unknown[] };
      return (
        <Image
          {...image}
          responseActions={responseActions as Parameters<typeof Image>[0]["responseActions"]}
          onResponseAction={(actionId) => console.log("Response action:", actionId)}
        />
      );
    },
  },
  "image-gallery": {
    presets: imageGalleryPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "search-results" satisfies ImageGalleryPresetName,
    chatContext: {
      userMessage: "Find me some reference images",
      preamble: "Here are some images I found:",
    },
    renderComponent: ({ data }) => {
      const galleryData = data as Parameters<typeof ImageGallery>[0];
      return (
        <ImageGallery
          {...galleryData}
          onImageClick={(id, image) => console.log("Image clicked:", id, image)}
        />
      );
    },
  },
  video: {
    presets: videoPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "with-poster" satisfies VideoPresetName,
    wrapper: MaxWidthWrapper,
    chatContext: {
      userMessage: "Find that video tutorial",
      preamble: "Here's the video:",
    },
    renderComponent: ({ data }) => {
      const { video, responseActions } = data as { video: Parameters<typeof Video>[0]; responseActions?: unknown[] };
      return (
        <Video
          {...video}
          responseActions={responseActions as Parameters<typeof Video>[0]["responseActions"]}
          onResponseAction={(actionId) => console.log("Response action:", actionId)}
        />
      );
    },
  },
  audio: {
    presets: audioPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "full" satisfies AudioPresetName,
    wrapper: MaxWidthSmWrapper,
    chatContext: {
      userMessage: "Play that song we talked about",
      preamble: "Here it is:",
    },
    renderComponent: ({ data }) => {
      const { audio, variant, responseActions } = data as { audio: Parameters<typeof Audio>[0]; variant?: "full" | "compact"; responseActions?: unknown[] };
      return (
        <Audio
          {...audio}
          variant={variant}
          responseActions={responseActions as Parameters<typeof Audio>[0]["responseActions"]}
          onResponseAction={(actionId) => console.log("Response action:", actionId)}
        />
      );
    },
  },
  "link-preview": {
    presets: linkPreviewPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "with-image" satisfies LinkPreviewPresetName,
    wrapper: MaxWidthWrapper,
    chatContext: {
      userMessage: "Find that article from earlier",
      preamble: "Was it this one?",
    },
    renderComponent: ({ data }) => {
      const { linkPreview, responseActions } = data as { linkPreview: Parameters<typeof LinkPreview>[0]; responseActions?: unknown[] };
      return (
        <LinkPreview
          {...linkPreview}
          responseActions={responseActions as Parameters<typeof LinkPreview>[0]["responseActions"]}
          onResponseAction={(actionId) => console.log("Response action:", actionId)}
        />
      );
    },
  },
  "option-list": {
    presets: optionListPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "max-selections" satisfies OptionListPresetName,
    wrapper: MaxWidthWrapper,
    chatContext: {
      userMessage: "Help me pick between these options",
      preamble: "What sounds good?",
    },
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
  "order-summary": {
    presets: orderSummaryPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "default" satisfies OrderSummaryPresetName,
    wrapper: MaxWidthWrapper,
    chatContext: {
      userMessage: "Place that order we discussed",
      preamble: "Here's the order summary for your review:",
    },
    renderComponent: ({ data }) => {
      const orderData = data as Parameters<typeof OrderSummary>[0];
      return (
        <OrderSummary
          {...orderData}
          onResponseAction={(actionId) => console.log("Response action:", actionId)}
        />
      );
    },
  },
  "parameter-slider": {
    presets: parameterSliderPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "photo-adjustments" satisfies ParameterSliderPresetName,
    wrapper: MaxWidthSmStartWrapper,
    chatContext: {
      userMessage: "Help me dial in the right settings",
      preamble: "Here are the settings if you want to fine-tune:",
    },
    renderComponent: ({ data }) => {
      const sliderData = data as Parameters<typeof ParameterSlider>[0];
      return (
        <ParameterSlider
          {...sliderData}
          onResponseAction={(actionId, values) => console.log("Action:", actionId, "Values:", values)}
        />
      );
    },
  },
  plan: {
    presets: planPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "simple" satisfies PlanPresetName,
    chatContext: {
      userMessage: "Help me plan out this project",
      preamble: "Here's what I'm working on:",
    },
    renderComponent: ({ data }) => <Plan {...(data as Parameters<typeof Plan>[0])} />,
  },
  "item-carousel": {
    presets: itemCarouselPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "recommendations" satisfies ItemCarouselPresetName,
    chatContext: {
      userMessage: "What should I listen to right now?",
      preamble: "Here are some recommendations:",
    },
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
    chatContext: {
      userMessage: "Run the tests",
      preamble: "Running tests...",
    },
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
