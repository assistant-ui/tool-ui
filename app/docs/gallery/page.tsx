import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { DocsBorderedShell } from "@/app/docs/_components/docs-bordered-shell";
import { DataTable } from "@/components/tool-ui/data-table";
import { Image } from "@/components/tool-ui/image";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import { StatsDisplay } from "@/components/tool-ui/stats-display";

const ApprovalCard = dynamic(() =>
  import("@/components/tool-ui/approval-card").then((m) => m.ApprovalCard),
);
const CitationList = dynamic(() =>
  import("@/components/tool-ui/citation").then((m) => m.CitationList),
);
const ImageGallery = dynamic(() =>
  import("@/components/tool-ui/image-gallery").then((m) => m.ImageGallery),
);
const Video = dynamic(() =>
  import("@/components/tool-ui/video").then((m) => m.Video),
);
const Audio = dynamic(() =>
  import("@/components/tool-ui/audio").then((m) => m.Audio),
);
const LinkPreview = dynamic(() =>
  import("@/components/tool-ui/link-preview").then((m) => m.LinkPreview),
);
const LinkedInPost = dynamic(() =>
  import("@/components/tool-ui/linkedin-post").then((m) => m.LinkedInPost),
);
const OptionList = dynamic(() =>
  import("@/components/tool-ui/option-list").then((m) => m.OptionList),
);
const OrderSummary = dynamic(() =>
  import("@/components/tool-ui/order-summary").then((m) => m.OrderSummary),
);
const Plan = dynamic(() =>
  import("@/components/tool-ui/plan").then((m) => m.Plan),
);
const Terminal = dynamic(() =>
  import("@/components/tool-ui/terminal").then((m) => m.Terminal),
);
const CodeBlock = dynamic(() =>
  import("@/components/tool-ui/code-block").then((m) => m.CodeBlock),
);
const Chart = dynamic(() =>
  import("@/components/tool-ui/chart").then((m) => m.Chart),
);
const PreferencesPanel = dynamic(() =>
  import("@/components/tool-ui/preferences-panel").then(
    (m) => m.PreferencesPanel,
  ),
);
const ProgressTracker = dynamic(() =>
  import("@/components/tool-ui/progress-tracker").then(
    (m) => m.ProgressTracker,
  ),
);
const QuestionFlow = dynamic(() =>
  import("@/components/tool-ui/question-flow").then((m) => m.QuestionFlow),
);
const MessageDraft = dynamic(() =>
  import("@/components/tool-ui/message-draft").then((m) => m.MessageDraft),
);
const WeatherWidget = dynamic(() =>
  import("@/components/tool-ui/weather-widget").then((m) => m.WeatherWidget),
);
import { approvalCardPresets } from "@/lib/presets/approval-card";
import { citationPresets } from "@/lib/presets/citation";
import { dataTablePresets } from "@/lib/presets/data-table";
import { itemCarouselPresets } from "@/lib/presets/item-carousel";
import { imagePresets } from "@/lib/presets/image";
import { imageGalleryPresets } from "@/lib/presets/image-gallery";
import { videoPresets } from "@/lib/presets/video";
import { audioPresets } from "@/lib/presets/audio";
import { linkPreviewPresets } from "@/lib/presets/link-preview";
import { linkedInPostPresets } from "@/lib/presets/linkedin-post";
import { optionListPresets } from "@/lib/presets/option-list";
import { orderSummaryPresets } from "@/lib/presets/order-summary";
import { planPresets } from "@/lib/presets/plan";
import { terminalPresets } from "@/lib/presets/terminal";
import { codeBlockPresets } from "@/lib/presets/code-block";
import { chartPresets } from "@/lib/presets/chart";
import { statsDisplayPresets } from "@/lib/presets/stats-display";
import { preferencesPanelPresets } from "@/lib/presets/preferences-panel";
import { progressTrackerPresets } from "@/lib/presets/progress-tracker";
import { questionFlowPresets } from "@/lib/presets/question-flow";
import { messageDraftPresets } from "@/lib/presets/message-draft";
import { weatherWidgetPresets } from "@/lib/presets/weather-widget";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse all Tool UI components in a visual gallery",
};

export const revalidate = 3600;

export default function ComponentsGalleryPage() {
  const galleryImage = imagePresets["with-source"].data.image;

  return (
    <DocsBorderedShell>
      <div className="scrollbar-subtle z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-10 lg:p-12">
        <div className="mx-auto columns-1 gap-5 pb-20 [column-fill:balance] md:columns-2 2xl:columns-3 2xl:gap-5">
          <div className="mb-5 flex justify-center [column-span:all] 2xl:mb-5">
            <DataTable {...dataTablePresets.stocks.data} />
          </div>

          <div className="mb-5 flex justify-center [column-span:all] 2xl:mb-5">
            <ItemCarousel {...itemCarouselPresets.recommendations.data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <StatsDisplay {...statsDisplayPresets["business-metrics"].data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <WeatherWidget
              {...weatherWidgetPresets["sunny-forecast"].data}
              current={{
                temp: 64,
                tempMin: 58,
                tempMax: 72,
                condition: "thunderstorm",
              }}
              updatedAt="2026-01-29T02:30:00Z"
              effects={{ enabled: true, quality: "low" }}
            />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <ImageGallery {...imageGalleryPresets["search-results"].data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <LinkPreview
              {...linkPreviewPresets["with-image"].data.linkPreview}
            />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <CitationList
              id="gallery-citations"
              citations={citationPresets.stacked.data.citations}
              variant="stacked"
            />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <Audio {...audioPresets["full"].data.audio} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <OptionList {...optionListPresets["max-selections"].data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <ApprovalCard {...approvalCardPresets["with-metadata"].data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <MessageDraft {...messageDraftPresets.email.data} />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <OrderSummary
              {...orderSummaryPresets.default.data}
              className="max-w-none"
            />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <Plan {...planPresets.comprehensive.data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <ProgressTracker {...progressTrackerPresets["in-progress"].data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <QuestionFlow {...questionFlowPresets.upfront.data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <OptionList {...optionListPresets.travel.data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <PreferencesPanel {...preferencesPanelPresets.privacy.data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <Terminal {...terminalPresets.success.data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <CodeBlock {...codeBlockPresets.typescript.data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <Chart id="gallery-chart" {...chartPresets.revenue.data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <Video {...videoPresets["with-poster"].data.video} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <Image {...galleryImage} alt={galleryImage.alt} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <LinkedInPost post={linkedInPostPresets.basic.data.post} />
          </div>

          {/* <div className="mb-5 flex justify-center break-inside-avoid 2xl:mb-5">
            <Link
              href="/builder"
              className="bg-foreground/5 text-muted-foreground bg-dot-grid hover:text-foreground hover:bg-primary/7 group flex min-h-[180px] w-full flex-row items-center justify-center gap-2 rounded-2xl p-6 text-center shadow-[inset_0_6px_20px_rgba(0,0,0,0.09)] transition-colors duration-300"
            >
              <span className="text-primary text-2xl font-light tracking-wide transition-transform duration-600 will-change-transform group-hover:scale-105">
                Build your own tool UI
              </span>
              <ArrowRightIcon className="size-6 shrink-0 transition-transform duration-600 will-change-transform group-hover:translate-x-3 group-hover:scale-105" />
            </Link>
          </div> */}
        </div>
      </div>
    </DocsBorderedShell>
  );
}
