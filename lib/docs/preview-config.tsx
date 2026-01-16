"use client";

import dynamic from "next/dynamic";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import type { PresetWithCodeGen } from "@/lib/presets/types";

import type { ApprovalCard } from "@/components/tool-ui/approval-card";
import type { Chart } from "@/components/tool-ui/chart";
import type { Citation } from "@/components/tool-ui/citation";
import type { CodeBlock } from "@/components/tool-ui/code-block";
import type { DataTable } from "@/components/tool-ui/data-table";
import type { Image } from "@/components/tool-ui/image";
import type { ImageGallery } from "@/components/tool-ui/image-gallery";
import type { Video } from "@/components/tool-ui/video";
import type { Audio } from "@/components/tool-ui/audio";
import type { LinkPreview } from "@/components/tool-ui/link-preview";
import type { MessageDraft } from "@/components/tool-ui/message-draft";
import type { ItemCarousel } from "@/components/tool-ui/item-carousel";
import type { OptionList } from "@/components/tool-ui/option-list";
import type { OrderSummary } from "@/components/tool-ui/order-summary";
import type { ParameterSlider } from "@/components/tool-ui/parameter-slider";
import type { Plan } from "@/components/tool-ui/plan";
import type { PreferencesPanel } from "@/components/tool-ui/preferences-panel";
import type { ProgressTracker } from "@/components/tool-ui/progress-tracker";
import type { StatsDisplay } from "@/components/tool-ui/stats-display";
import type { Terminal } from "@/components/tool-ui/terminal";

import {
  approvalCardPresets,
  type ApprovalCardPresetName,
} from "@/lib/presets/approval-card";
import { chartPresets, type ChartPresetName } from "@/lib/presets/chart";
import {
  citationPresets,
  type CitationPresetName,
} from "@/lib/presets/citation";
import {
  codeBlockPresets,
  type CodeBlockPresetName,
} from "@/lib/presets/code-block";
import {
  dataTablePresets,
  type DataTablePresetName,
  type SortState,
} from "@/lib/presets/data-table";
import { imagePresets, type ImagePresetName } from "@/lib/presets/image";
import {
  imageGalleryPresets,
  type ImageGalleryPresetName,
} from "@/lib/presets/image-gallery";
import { videoPresets, type VideoPresetName } from "@/lib/presets/video";
import { audioPresets, type AudioPresetName } from "@/lib/presets/audio";
import {
  linkPreviewPresets,
  type LinkPreviewPresetName,
} from "@/lib/presets/link-preview";
import {
  messageDraftPresets,
  type MessageDraftPresetName,
} from "@/lib/presets/message-draft";
import {
  itemCarouselPresets,
  type ItemCarouselPresetName,
} from "@/lib/presets/item-carousel";
import {
  optionListPresets,
  type OptionListPresetName,
} from "@/lib/presets/option-list";
import {
  orderSummaryPresets,
  type OrderSummaryPresetName,
} from "@/lib/presets/order-summary";
import {
  parameterSliderPresets,
  type ParameterSliderPresetName,
} from "@/lib/presets/parameter-slider";
import { planPresets, type PlanPresetName } from "@/lib/presets/plan";
import {
  preferencesPanelPresets,
  type PreferencesPanelPresetName,
} from "@/lib/presets/preferences-panel";
import {
  progressTrackerPresets,
  type ProgressTrackerPresetName,
} from "@/lib/presets/progress-tracker";
import {
  statsDisplayPresets,
  type StatsDisplayPresetName,
} from "@/lib/presets/stats-display";
import {
  terminalPresets,
  type TerminalPresetName,
} from "@/lib/presets/terminal";

const DynamicApprovalCard = dynamic(() =>
  import("@/components/tool-ui/approval-card").then((m) => m.ApprovalCard)
);
const DynamicChart = dynamic(() =>
  import("@/components/tool-ui/chart").then((m) => m.Chart)
);
const DynamicCitation = dynamic(() =>
  import("@/components/tool-ui/citation").then((m) => m.Citation)
);
const DynamicCitationList = dynamic(() =>
  import("@/components/tool-ui/citation").then((m) => m.CitationList)
);
const DynamicCodeBlock = dynamic(() =>
  import("@/components/tool-ui/code-block").then((m) => m.CodeBlock)
);
const DynamicDataTable = dynamic(() =>
  import("@/components/tool-ui/data-table").then((m) => m.DataTable)
);
const DynamicImage = dynamic(() =>
  import("@/components/tool-ui/image").then((m) => m.Image)
);
const DynamicImageGallery = dynamic(() =>
  import("@/components/tool-ui/image-gallery").then((m) => m.ImageGallery)
);
const DynamicVideo = dynamic(() =>
  import("@/components/tool-ui/video").then((m) => m.Video)
);
const DynamicAudio = dynamic(() =>
  import("@/components/tool-ui/audio").then((m) => m.Audio)
);
const DynamicLinkPreview = dynamic(() =>
  import("@/components/tool-ui/link-preview").then((m) => m.LinkPreview)
);
const DynamicMessageDraft = dynamic(() =>
  import("@/components/tool-ui/message-draft").then((m) => m.MessageDraft)
);
const DynamicItemCarousel = dynamic(() =>
  import("@/components/tool-ui/item-carousel").then((m) => m.ItemCarousel)
);
const DynamicOptionList = dynamic(() =>
  import("@/components/tool-ui/option-list").then((m) => m.OptionList)
);
const DynamicOrderSummary = dynamic(() =>
  import("@/components/tool-ui/order-summary").then((m) => m.OrderSummary)
);
const DynamicParameterSlider = dynamic(() =>
  import("@/components/tool-ui/parameter-slider").then((m) => m.ParameterSlider)
);
const DynamicPlan = dynamic(() =>
  import("@/components/tool-ui/plan").then((m) => m.Plan)
);
const DynamicPreferencesPanel = dynamic(() =>
  import("@/components/tool-ui/preferences-panel").then((m) => m.PreferencesPanel)
);
const DynamicProgressTracker = dynamic(() =>
  import("@/components/tool-ui/progress-tracker").then((m) => m.ProgressTracker)
);
const DynamicStatsDisplay = dynamic(() =>
  import("@/components/tool-ui/stats-display").then((m) => m.StatsDisplay)
);
const DynamicTerminal = dynamic(() =>
  import("@/components/tool-ui/terminal").then((m) => m.Terminal)
);

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
  | "message-draft"
  | "item-carousel"
  | "option-list"
  | "order-summary"
  | "parameter-slider"
  | "plan"
  | "preferences-panel"
  | "progress-tracker"
  | "stats-display"
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

function MaxWidthStartWrapper({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-md">{children}</div>;
}

export const previewConfigs: Record<
  ComponentId,
  PreviewConfig<unknown, string>
> = {
  "approval-card": {
    presets: approvalCardPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "deploy" satisfies ApprovalCardPresetName,
    wrapper: MaxWidthSmWrapper,
    chatContext: {
      userMessage: "Deploy the latest changes to production",
      preamble: "I'll need your confirmation before proceeding:",
    },
    renderComponent: ({ data }) => {
      const cardData = data as ComponentProps<typeof ApprovalCard>;
      return (
        <DynamicApprovalCard
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
      return <DynamicChart id={`chart-${presetName}`} {...chartData} />;
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
            <DynamicCitation
              {...citations[0]}
              variant={variant}
              responseActions={
                responseActions as Parameters<
                  typeof Citation
                >[0]["responseActions"]
              }
              onResponseAction={(actionId) =>
                console.log("Response action:", actionId)
              }
            />
          </div>
        );
      }

      // Multiple citations or truncated list
      const wrapperClass =
        variant === "inline" ? "mx-auto max-w-xl" : "mx-auto max-w-lg";

      return (
        <div className={wrapperClass}>
          <DynamicCitationList
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
    renderComponent: ({ data }) => (
      <DynamicCodeBlock {...(data as Parameters<typeof CodeBlock>[0])} />
    ),
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
        <DynamicDataTable
          {...tableData}
          sort={state.sort as Parameters<typeof DataTable>[0]["sort"]}
          onSortChange={(sort) => setState({ sort })}
          onResponseAction={(actionId) =>
            console.log("Response action:", actionId)
          }
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
      const { image, responseActions } = data as {
        image: Parameters<typeof Image>[0];
        responseActions?: unknown[];
      };
      return (
        <DynamicImage
          {...image}
          responseActions={
            responseActions as Parameters<typeof Image>[0]["responseActions"]
          }
          onResponseAction={(actionId) =>
            console.log("Response action:", actionId)
          }
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
        <DynamicImageGallery
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
      const { video, responseActions } = data as {
        video: Parameters<typeof Video>[0];
        responseActions?: unknown[];
      };
      return (
        <DynamicVideo
          {...video}
          responseActions={
            responseActions as Parameters<typeof Video>[0]["responseActions"]
          }
          onResponseAction={(actionId) =>
            console.log("Response action:", actionId)
          }
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
      const { audio, variant, responseActions } = data as {
        audio: Parameters<typeof Audio>[0];
        variant?: "full" | "compact";
        responseActions?: unknown[];
      };
      return (
        <DynamicAudio
          {...audio}
          variant={variant}
          responseActions={
            responseActions as Parameters<typeof Audio>[0]["responseActions"]
          }
          onResponseAction={(actionId) =>
            console.log("Response action:", actionId)
          }
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
      const { linkPreview, responseActions } = data as {
        linkPreview: Parameters<typeof LinkPreview>[0];
        responseActions?: unknown[];
      };
      return (
        <DynamicLinkPreview
          {...linkPreview}
          responseActions={
            responseActions as Parameters<
              typeof LinkPreview
            >[0]["responseActions"]
          }
          onResponseAction={(actionId) =>
            console.log("Response action:", actionId)
          }
        />
      );
    },
  },
  "message-draft": {
    presets: messageDraftPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "email" satisfies MessageDraftPresetName,
    wrapper: MaxWidthStartWrapper,
    chatContext: {
      userMessage: "Send Marcus the updated proposal",
      preamble: "I've drafted this message for your review:",
    },
    renderComponent: ({ data }) => {
      const draftData = data as Parameters<typeof MessageDraft>[0];
      return (
        <DynamicMessageDraft
          {...draftData}
          onSend={() => console.log("Message sent")}
          onUndo={() => console.log("Send undone")}
          onCancel={() => console.log("Message cancelled")}
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
        <DynamicOptionList
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
        <DynamicOrderSummary
          {...orderData}
          onResponseAction={(actionId) =>
            console.log("Response action:", actionId)
          }
        />
      );
    },
  },
  "parameter-slider": {
    presets: parameterSliderPresets as Record<
      string,
      PresetWithCodeGen<unknown>
    >,
    defaultPreset: "audio-eq" satisfies ParameterSliderPresetName,
    wrapper: MaxWidthSmStartWrapper,
    chatContext: {
      userMessage: "Boost the bass a bit on this track",
      preamble: "Here are the current EQ settings:",
    },
    renderComponent: ({ data, presetName }) => {
      const sliderData = data as Parameters<typeof ParameterSlider>[0];
      const isAudioEq = presetName === "audio-eq";

      // Apply per-slider neon theming for audio-eq preset
      const themedSliders = isAudioEq
        ? sliderData.sliders.map((slider, i) => ({
            ...slider,
            trackClassName: "bg-zinc-900/80 dark:bg-zinc-950/90",
            fillClassName: [
              "bg-cyan-500/40",
              "bg-fuchsia-500/40",
              "bg-amber-500/40",
            ][i],
            handleClassName: ["bg-cyan-400", "bg-fuchsia-400", "bg-amber-400"][
              i
            ],
          }))
        : sliderData.sliders;

      return (
        <DynamicParameterSlider
          {...sliderData}
          sliders={themedSliders}
          onResponseAction={(actionId, values) =>
            console.log("Action:", actionId, "Values:", values)
          }
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
    renderComponent: ({ data }) => (
      <DynamicPlan {...(data as Parameters<typeof Plan>[0])} />
    ),
  },
  "preferences-panel": {
    presets: preferencesPanelPresets as Record<
      string,
      PresetWithCodeGen<unknown>
    >,
    defaultPreset: "notifications" satisfies PreferencesPanelPresetName,
    wrapper: MaxWidthStartWrapper,
    chatContext: {
      userMessage: "Update my notification settings",
      preamble: "Here are your current preferences:",
    },
    renderComponent: ({ data, state, setState }) => {
      const panelData = data as Parameters<typeof PreferencesPanel>[0];
      return (
        <DynamicPreferencesPanel
          {...panelData}
          value={
            state.selection as Record<string, string | boolean> | undefined
          }
          onChange={(value) =>
            setState({
              selection: value as unknown as string[] | string | null,
            })
          }
          onSave={async (values) => console.log("Saved:", values)}
          onCancel={() => console.log("Cancelled")}
        />
      );
    },
  },
  "progress-tracker": {
    presets: progressTrackerPresets as Record<
      string,
      PresetWithCodeGen<unknown>
    >,
    defaultPreset: "in-progress" satisfies ProgressTrackerPresetName,
    wrapper: MaxWidthSmStartWrapper,
    chatContext: {
      userMessage: "Deploy the application to production",
      preamble: "Starting deployment process:",
    },
    renderComponent: ({ data }) => {
      const trackerData = data as Parameters<typeof ProgressTracker>[0];
      return (
        <DynamicProgressTracker
          {...trackerData}
          onResponseAction={(actionId) =>
            console.log("Response action:", actionId)
          }
        />
      );
    },
  },
  "stats-display": {
    presets: statsDisplayPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "business-metrics" satisfies StatsDisplayPresetName,
    chatContext: {
      userMessage: "Show me the key metrics for this quarter",
      preamble: "Here's your performance summary:",
    },
    renderComponent: ({ data }) => {
      const statsData = data as Parameters<typeof StatsDisplay>[0];
      return <DynamicStatsDisplay {...statsData} />;
    },
  },
  "item-carousel": {
    presets: itemCarouselPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "recommendations" satisfies ItemCarouselPresetName,
    chatContext: {
      userMessage: "What should I listen to right now?",
      preamble: "Here are some recommendations:",
    },
    renderComponent: ({ data }) => (
      <DynamicItemCarousel
        {...(data as Parameters<typeof ItemCarousel>[0])}
        onItemClick={(itemId) => console.log("Item clicked:", itemId)}
        onItemAction={(itemId, actionId) =>
          console.log("Item action:", itemId, actionId)
        }
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
      <DynamicTerminal
        {...(data as Parameters<typeof Terminal>[0])}
        id="terminal-preview"
        onResponseAction={(actionId) =>
          console.log("Response action:", actionId)
        }
      />
    ),
  },
};

export function getPreviewConfig(componentId: ComponentId) {
  return previewConfigs[componentId];
}
