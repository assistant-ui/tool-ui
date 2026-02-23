"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import type { PresetWithCodeGen } from "@/lib/presets/types";
import type { ComponentId } from "@/lib/docs/component-ids";

import type { ApprovalCard } from "@/components/tool-ui/approval-card";
import type { Chart } from "@/components/tool-ui/chart";
import type { Citation } from "@/components/tool-ui/citation";
import type { CodeBlockComposedProps } from "@/components/tool-ui/code-block";
import { CodeBlock } from "@/components/tool-ui/code-block";
import type { CodeDiffComposedProps } from "@/components/tool-ui/code-diff";
import type { DataTable } from "@/components/tool-ui/data-table";
import type { Image } from "@/components/tool-ui/image";
import type { ImageGallery } from "@/components/tool-ui/image-gallery";
import type { Video } from "@/components/tool-ui/video";
import type { Audio } from "@/components/tool-ui/audio";
import type { InstagramPost } from "@/components/tool-ui/instagram-post";
import type { LinkPreview } from "@/components/tool-ui/link-preview";
import type { LinkedInPost } from "@/components/tool-ui/linkedin-post";
import type { MessageDraft } from "@/components/tool-ui/message-draft";
import type { ItemCarousel } from "@/components/tool-ui/item-carousel";
import type { OptionList } from "@/components/tool-ui/option-list";
import type { OrderSummary } from "@/components/tool-ui/order-summary";
import type { ParameterSlider } from "@/components/tool-ui/parameter-slider";
import type { SerializablePlan } from "@/components/tool-ui/plan";
import type {
  SerializablePreferencesPanel,
  SerializablePreferencesPanelReceipt,
} from "@/components/tool-ui/preferences-panel";
import type { ProgressTracker } from "@/components/tool-ui/progress-tracker";
import type { StatsDisplay } from "@/components/tool-ui/stats-display";
import type { Terminal } from "@/components/tool-ui/terminal";
import type { QuestionFlow } from "@/components/tool-ui/question-flow";
import type { WeatherWidget } from "@/components/tool-ui/weather-widget/runtime";
import type { XPost } from "@/components/tool-ui/x-post";
import {
  ToolUI,
  createDecisionResult,
  type Action,
  type DecisionAction,
} from "@/components/tool-ui/shared";

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
  codeDiffPresets,
  type CodeDiffPresetName,
} from "@/lib/presets/code-diff";
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
  instagramPostPresets,
  type InstagramPostPresetName,
} from "@/lib/presets/instagram-post";
import {
  linkPreviewPresets,
  type LinkPreviewPresetName,
} from "@/lib/presets/link-preview";
import {
  linkedInPostPresets,
  type LinkedInPostPresetName,
} from "@/lib/presets/linkedin-post";
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
import {
  questionFlowPresets,
  type QuestionFlowPresetName,
} from "@/lib/presets/question-flow";
import {
  weatherWidgetPresets,
  type WeatherWidgetPresetName,
} from "@/lib/presets/weather-widget";
import { xPostPresets, type XPostPresetName } from "@/lib/presets/x-post";
import type { SerializableUpfrontMode } from "@/components/tool-ui/question-flow";

const DynamicApprovalCard = dynamic(() =>
  import("@/components/tool-ui/approval-card").then((m) => m.ApprovalCard),
);
const DynamicChart = dynamic(() =>
  import("@/components/tool-ui/chart").then((m) => m.Chart),
);
const DynamicCitation = dynamic(() =>
  import("@/components/tool-ui/citation").then((m) => m.Citation),
);
const DynamicCitationList = dynamic(() =>
  import("@/components/tool-ui/citation").then((m) => m.CitationList),
);
const DynamicCodeDiff = dynamic(() =>
  import("@/components/tool-ui/code-diff").then((m) => m.CodeDiff),
);
const DynamicDataTable = dynamic(() =>
  import("@/components/tool-ui/data-table").then((m) => m.DataTable),
);
const DynamicImage = dynamic(() =>
  import("@/components/tool-ui/image").then((m) => m.Image),
);
const DynamicImageGallery = dynamic(() =>
  import("@/components/tool-ui/image-gallery").then((m) => m.ImageGallery),
);
const DynamicVideo = dynamic(() =>
  import("@/components/tool-ui/video").then((m) => m.Video),
);
const DynamicAudio = dynamic(() =>
  import("@/components/tool-ui/audio").then((m) => m.Audio),
);
const DynamicInstagramPost = dynamic(() =>
  import("@/components/tool-ui/instagram-post").then((m) => m.InstagramPost),
);
const DynamicLinkPreview = dynamic(() =>
  import("@/components/tool-ui/link-preview").then((m) => m.LinkPreview),
);
const DynamicLinkedInPost = dynamic(() =>
  import("@/components/tool-ui/linkedin-post").then((m) => m.LinkedInPost),
);
const DynamicMessageDraft = dynamic(() =>
  import("@/components/tool-ui/message-draft").then((m) => m.MessageDraft),
);
const DynamicItemCarousel = dynamic(() =>
  import("@/components/tool-ui/item-carousel").then((m) => m.ItemCarousel),
);
const DynamicOptionList = dynamic(() =>
  import("@/components/tool-ui/option-list").then((m) => m.OptionList),
);
const DynamicOrderSummary = dynamic(() =>
  import("@/components/tool-ui/order-summary").then((m) => m.OrderSummary),
);
const DynamicParameterSlider = dynamic(() =>
  import("@/components/tool-ui/parameter-slider").then(
    (m) => m.ParameterSlider,
  ),
);
const DynamicPlan = dynamic(() =>
  import("@/components/tool-ui/plan").then((m) => m.Plan),
);
const DynamicPlanCompact = dynamic(() =>
  import("@/components/tool-ui/plan").then((m) => m.PlanCompact),
);
const DynamicPreferencesPanel = dynamic(() =>
  import("@/components/tool-ui/preferences-panel").then(
    (m) => m.PreferencesPanel,
  ),
);
const DynamicPreferencesPanelReceipt = dynamic(() =>
  import("@/components/tool-ui/preferences-panel").then(
    (m) => m.PreferencesPanelReceipt,
  ),
);
const DynamicProgressTracker = dynamic(() =>
  import("@/components/tool-ui/progress-tracker").then(
    (m) => m.ProgressTracker,
  ),
);
const DynamicStatsDisplay = dynamic(() =>
  import("@/components/tool-ui/stats-display").then((m) => m.StatsDisplay),
);
const DynamicTerminal = dynamic(() =>
  import("@/components/tool-ui/terminal").then((m) => m.Terminal),
);
const DynamicQuestionFlow = dynamic(() =>
  import("@/components/tool-ui/question-flow").then((m) => m.QuestionFlow),
);
const DynamicWeatherWidget = dynamic(() =>
  import("@/components/tool-ui/weather-widget/runtime").then(
    (m) => m.WeatherWidget,
  ),
);
const DynamicXPost = dynamic(() =>
  import("@/components/tool-ui/x-post").then((m) => m.XPost),
);

function QuestionFlowUpfrontWithReceipt({
  data,
}: {
  data: SerializableUpfrontMode;
}) {
  const [completedAnswers, setCompletedAnswers] = useState<Record<
    string,
    string[]
  > | null>(null);

  if (completedAnswers) {
    const summary = data.steps.map((step) => {
      const selectedIds = completedAnswers[step.id] ?? [];
      const selectedLabels = selectedIds
        .map((id) => step.options.find((opt) => opt.id === id)?.label ?? id)
        .join(", ");
      return {
        label: step.title.replace(/^(Select|Choose)\s+(a\s+|your\s+)?/i, ""),
        value: selectedLabels || "None",
      };
    });

    const title = data.id
      .replace(/^question-flow-?/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
      <DynamicQuestionFlow
        id={data.id}
        choice={{
          title,
          summary,
        }}
      />
    );
  }

  return (
    <DynamicQuestionFlow
      {...data}
      onComplete={(answers: Record<string, string[]>) =>
        setCompletedAnswers(answers)
      }
    />
  );
}

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
  selection?: unknown;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function resolveActionItems(actions: unknown): Action[] | null {
  if (Array.isArray(actions)) {
    return actions as Action[];
  }

  const record = toRecord(actions);
  const items = record?.["items"];
  return Array.isArray(items) ? (items as Action[]) : null;
}

function resolveLocalActionItems(data: unknown): Action[] | null {
  const record = toRecord(data);
  if (!record) return null;
  return resolveActionItems(record["localActions"]);
}

function renderWithLocalActions(
  id: string,
  surface: ReactNode,
  localActions: Action[] | null,
) {
  if (!localActions || localActions.length === 0) {
    return surface;
  }

  return (
    <ToolUI id={id}>
      <ToolUI.Surface>{surface}</ToolUI.Surface>
      <ToolUI.Actions>
        <ToolUI.LocalActions
          actions={localActions}
          onAction={(actionId) => console.log("Local action:", actionId)}
        />
      </ToolUI.Actions>
    </ToolUI>
  );
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
    renderComponent: ({ data, state, setState }) => {
      const cardData = data as ComponentProps<typeof ApprovalCard>;
      const choice = state.selection as "approved" | "denied" | undefined;
      return (
        <DynamicApprovalCard
          {...cardData}
          choice={cardData.choice ?? choice}
          onConfirm={() => setState({ selection: "approved" })}
          onCancel={() => setState({ selection: "denied" })}
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
      const { citations, variant, maxVisible } = data as {
        citations: Parameters<typeof Citation>[0][];
        variant?: Parameters<typeof Citation>[0]["variant"];
        maxVisible?: number;
      };
      const localActionItems = resolveLocalActionItems(data);

      const wrapperClass =
        variant === "inline" ? "mx-auto max-w-xl" : "mx-auto max-w-lg";

      // Single citation without list
      if (citations.length === 1 && !maxVisible) {
        const citation = citations[0];

        return renderWithLocalActions(
          citation.id,
          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            <DynamicCitation {...citation} variant={variant} />
          </div>,
          localActionItems,
        );
      }

      // Multiple citations or truncated list
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
    renderComponent: ({ data }) => {
      const codeBlock = data as CodeBlockComposedProps;
      return <CodeBlock {...codeBlock} />;
    },
  },
  "code-diff": {
    presets: codeDiffPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "refactor" satisfies CodeDiffPresetName,
    chatContext: {
      userMessage: "Can you make fetchUser return null instead of throwing?",
      preamble: "Here's the updated function:",
    },
    renderComponent: ({ data }) => {
      const diffData = data as CodeDiffComposedProps;
      return <DynamicCodeDiff {...diffData} />;
    },
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
      const localActionItems = resolveLocalActionItems(data);
      return renderWithLocalActions(
        tableData.id,
        <div className="flex w-full flex-col gap-4">
          <DynamicDataTable
            {...tableData}
            sort={state.sort as Parameters<typeof DataTable>[0]["sort"]}
            onSortChange={(sort) => setState({ sort })}
          />
        </div>,
        localActionItems,
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
      const { image } = data as {
        image: Parameters<typeof Image>[0];
      };
      const localActionItems = resolveLocalActionItems(data);
      return renderWithLocalActions(
        image.id,
        <div className="flex flex-col gap-3">
          <DynamicImage {...image} />
        </div>,
        localActionItems,
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
      const { video } = data as {
        video: Parameters<typeof Video>[0];
      };
      const localActionItems = resolveLocalActionItems(data);
      return renderWithLocalActions(
        video.id,
        <div className="flex flex-col gap-3">
          <DynamicVideo {...video} />
        </div>,
        localActionItems,
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
      const { audio, variant } = data as {
        audio: Parameters<typeof Audio>[0];
        variant?: "full" | "compact";
      };
      const localActionItems = resolveLocalActionItems(data);
      return renderWithLocalActions(
        audio.id,
        <div className="flex flex-col gap-3">
          <DynamicAudio {...audio} variant={variant} />
        </div>,
        localActionItems,
      );
    },
  },
  "instagram-post": {
    presets: instagramPostPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "basic" satisfies InstagramPostPresetName,
    wrapper: MaxWidthSmWrapper,
    chatContext: {
      userMessage: "Draft an Instagram post for this launch",
      preamble: "Here's the post preview:",
    },
    renderComponent: ({ data }) => {
      const instagramData = data as {
        post: Parameters<typeof InstagramPost>[0]["post"];
      };
      const localActionItems = resolveLocalActionItems(data);
      return renderWithLocalActions(
        instagramData.post.id,
        <div className="flex flex-col gap-3">
          <DynamicInstagramPost post={instagramData.post} />
        </div>,
        localActionItems,
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
      const { linkPreview } = data as {
        linkPreview: Parameters<typeof LinkPreview>[0];
      };
      const localActionItems = resolveLocalActionItems(data);
      return renderWithLocalActions(
        linkPreview.id,
        <div className="flex flex-col gap-3">
          <DynamicLinkPreview {...linkPreview} />
        </div>,
        localActionItems,
      );
    },
  },
  "linkedin-post": {
    presets: linkedInPostPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "basic" satisfies LinkedInPostPresetName,
    wrapper: MaxWidthSmWrapper,
    chatContext: {
      userMessage: "Create a LinkedIn update about the release",
      preamble: "Here's the LinkedIn post preview:",
    },
    renderComponent: ({ data }) => {
      const linkedInData = data as {
        post: Parameters<typeof LinkedInPost>[0]["post"];
      };
      const localActionItems = resolveLocalActionItems(data);
      return renderWithLocalActions(
        linkedInData.post.id,
        <div className="flex flex-col gap-3">
          <DynamicLinkedInPost post={linkedInData.post} />
        </div>,
        localActionItems,
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
          value={state.selection as Parameters<typeof OptionList>[0]["value"]}
          onChange={(selection) => setState({ selection })}
          onAction={(actionId, selection) => {
            if (actionId !== "confirm") return;
            console.log("OptionList confirmed:", selection);
            alert(`Selection confirmed: ${JSON.stringify(selection)}`);
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
    renderComponent: ({ data, state, setState }) => {
      const orderData = data as Parameters<typeof OrderSummary>[0];
      const decisionActions = (resolveActionItems(
        toRecord(data)?.["decisionActions"],
      ) as DecisionAction[] | null) ?? [
        { id: "cancel", label: "Cancel", variant: "outline" },
        { id: "confirm", label: "Purchase", variant: "default" },
      ];
      const receiptChoice =
        (state.selection as
          | Parameters<typeof OrderSummary>[0]["choice"]
          | undefined) ?? undefined;

      if (orderData.choice ?? receiptChoice) {
        return (
          <DynamicOrderSummary
            {...orderData}
            choice={orderData.choice ?? receiptChoice}
          />
        );
      }

      return (
        <ToolUI id={orderData.id}>
          <ToolUI.Surface>
            <DynamicOrderSummary {...orderData} />
          </ToolUI.Surface>
          <ToolUI.Actions>
            <ToolUI.DecisionActions
              actions={decisionActions}
              onAction={(action) =>
                createDecisionResult({
                  decisionId: `${orderData.id}-decision`,
                  action,
                })
              }
              onCommit={(result) => {
                if (result.actionId === "confirm") {
                  setState({
                    selection: {
                      action: "confirm",
                      orderId: `ORD-${Date.now().toString().slice(-6)}`,
                      confirmedAt: result.at,
                    },
                  });
                  return;
                }

                setState({ selection: null });
              }}
            />
          </ToolUI.Actions>
        </ToolUI>
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
          onAction={(actionId, values) =>
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
    renderComponent: ({ data, presetName }) => {
      const planData = data as SerializablePlan;
      if (presetName === "compact") {
        return <DynamicPlanCompact {...planData} />;
      }
      return <DynamicPlan {...planData} />;
    },
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
      const panelData = data as
        | SerializablePreferencesPanel
        | SerializablePreferencesPanelReceipt;

      if ("choice" in panelData) {
        return <DynamicPreferencesPanelReceipt {...panelData} />;
      }

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
          onAction={async (actionId, values) =>
            console.log("Action:", actionId, "Values:", values)
          }
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
      return <DynamicProgressTracker {...trackerData} />;
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
    renderComponent: ({ data }) => {
      const terminalData = data as Parameters<typeof Terminal>[0];
      const localActionItems = resolveLocalActionItems(data);

      return renderWithLocalActions(
        terminalData.id,
        <div className="flex w-full flex-col gap-3">
          <DynamicTerminal {...terminalData} />
        </div>,
        localActionItems,
      );
    },
  },
  "question-flow": {
    presets: questionFlowPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "upfront" satisfies QuestionFlowPresetName,
    wrapper: MaxWidthWrapper,
    chatContext: {
      userMessage: "Help me set up a new project",
      preamble: "Let's configure your project step by step:",
    },
    renderComponent: ({ data, presetName }) => {
      const flowData = data as Parameters<typeof QuestionFlow>[0];
      const isUpfront = "steps" in flowData && flowData.steps !== undefined;
      const isReceipt = "choice" in flowData && flowData.choice !== undefined;

      if (isReceipt) {
        return <DynamicQuestionFlow key={presetName} {...flowData} />;
      }

      if (isUpfront) {
        return (
          <QuestionFlowUpfrontWithReceipt
            key={presetName}
            data={flowData as SerializableUpfrontMode}
          />
        );
      }

      return (
        <DynamicQuestionFlow
          key={presetName}
          {...flowData}
          onSelect={(ids: string[]) => console.log("Selected:", ids)}
          onBack={() => console.log("Go back")}
        />
      );
    },
  },
  "weather-widget": {
    presets: weatherWidgetPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "thunderstorm" satisfies WeatherWidgetPresetName,
    wrapper: MaxWidthSmStartWrapper,
    chatContext: {
      userMessage: "What's the weather like in San Diego?",
      preamble: "Here's the current weather:",
    },
    renderComponent: ({ data }) => (
      <DynamicWeatherWidget
        {...(data as Parameters<typeof WeatherWidget>[0])}
      />
    ),
  },
  "x-post": {
    presets: xPostPresets as Record<string, PresetWithCodeGen<unknown>>,
    defaultPreset: "basic" satisfies XPostPresetName,
    wrapper: MaxWidthSmWrapper,
    chatContext: {
      userMessage: "Write a post for X about today's launch",
      preamble: "Here's the X post preview:",
    },
    renderComponent: ({ data }) => {
      const xPostData = data as {
        post: Parameters<typeof XPost>[0]["post"];
      };
      const localActionItems = resolveLocalActionItems(data);
      return renderWithLocalActions(
        xPostData.post.id,
        <div className="flex flex-col gap-3">
          <DynamicXPost post={xPostData.post} />
        </div>,
        localActionItems,
      );
    },
  },
};

export function getPreviewConfig(componentId: ComponentId) {
  return previewConfigs[componentId];
}

export type { ComponentId } from "@/lib/docs/component-ids";
