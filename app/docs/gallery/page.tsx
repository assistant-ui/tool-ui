import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { DocsBorderedShell } from "@/app/docs/_components/docs-bordered-shell";
import { DataTable } from "@/components/tool-ui/data-table";
import { Image } from "@/components/tool-ui/image";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import { StatsDisplay } from "@/components/tool-ui/stats-display";

const ApprovalCard = dynamic(() =>
  import("@/components/tool-ui/approval-card").then((m) => m.ApprovalCard)
);
const CitationList = dynamic(() =>
  import("@/components/tool-ui/citation").then((m) => m.CitationList)
);
const ImageGallery = dynamic(() =>
  import("@/components/tool-ui/image-gallery").then((m) => m.ImageGallery)
);
const Video = dynamic(() =>
  import("@/components/tool-ui/video").then((m) => m.Video)
);
const Audio = dynamic(() =>
  import("@/components/tool-ui/audio").then((m) => m.Audio)
);
const LinkPreview = dynamic(() =>
  import("@/components/tool-ui/link-preview").then((m) => m.LinkPreview)
);
const LinkedInPost = dynamic(() =>
  import("@/components/tool-ui/linkedin-post").then((m) => m.LinkedInPost)
);
const OptionList = dynamic(() =>
  import("@/components/tool-ui/option-list").then((m) => m.OptionList)
);
const OrderSummary = dynamic(() =>
  import("@/components/tool-ui/order-summary").then((m) => m.OrderSummary)
);
const Plan = dynamic(() =>
  import("@/components/tool-ui/plan").then((m) => m.Plan)
);
const Terminal = dynamic(() =>
  import("@/components/tool-ui/terminal").then((m) => m.Terminal)
);
const CodeBlock = dynamic(() =>
  import("@/components/tool-ui/code-block").then((m) => m.CodeBlock)
);
const Chart = dynamic(() =>
  import("@/components/tool-ui/chart").then((m) => m.Chart)
);
const PreferencesPanel = dynamic(() =>
  import("@/components/tool-ui/preferences-panel").then((m) => m.PreferencesPanel)
);
const ProgressTracker = dynamic(() =>
  import("@/components/tool-ui/progress-tracker").then((m) => m.ProgressTracker)
);
const QuestionFlow = dynamic(() =>
  import("@/components/tool-ui/question-flow").then((m) => m.QuestionFlow)
);
const MessageDraft = dynamic(() =>
  import("@/components/tool-ui/message-draft").then((m) => m.MessageDraft)
);
const WeatherWidget = dynamic(() =>
  import("@/components/tool-ui/weather-widget").then((m) => m.WeatherWidget)
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
        <div className="mx-auto grid auto-rows-max grid-cols-1 gap-5 pb-20 md:grid-cols-2 2xl:grid-cols-3">
          {/* Full-width items */}
          <div className="flex justify-center md:col-span-2 2xl:col-span-3">
            <DataTable {...dataTablePresets.stocks.data} />
          </div>

          <div className="flex justify-center md:col-span-2 2xl:col-span-3">
            <ItemCarousel {...itemCarouselPresets.recommendations.data} />
          </div>

          {/* Grid items with layout containment */}
          <div className="flex justify-center [contain:layout_paint]">
            <StatsDisplay {...statsDisplayPresets["business-metrics"].data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
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

          <div className="flex justify-center [contain:layout_paint]">
            <ImageGallery {...imageGalleryPresets["search-results"].data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <LinkPreview
              {...linkPreviewPresets["with-image"].data.linkPreview}
            />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <CitationList
              id="gallery-citations"
              citations={citationPresets.stacked.data.citations}
              variant="stacked"
            />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <Audio {...audioPresets["full"].data.audio} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <OptionList {...optionListPresets["max-selections"].data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <ApprovalCard {...approvalCardPresets["with-metadata"].data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <MessageDraft {...messageDraftPresets.email.data} />
          </div>

          <div className="[contain:layout_paint]">
            <OrderSummary
              {...orderSummaryPresets.default.data}
              className="max-w-none"
            />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <Plan {...planPresets.comprehensive.data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <ProgressTracker {...progressTrackerPresets["in-progress"].data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <QuestionFlow {...questionFlowPresets.upfront.data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <OptionList {...optionListPresets.travel.data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <PreferencesPanel {...preferencesPanelPresets.privacy.data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <Terminal {...terminalPresets.success.data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <CodeBlock {...codeBlockPresets.typescript.data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <Chart id="gallery-chart" {...chartPresets.revenue.data} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <Video {...videoPresets["with-poster"].data.video} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <Image {...galleryImage} alt={galleryImage.alt} />
          </div>

          <div className="flex justify-center [contain:layout_paint]">
            <LinkedInPost post={linkedInPostPresets.basic.data.post} />
          </div>
        </div>
      </div>
    </DocsBorderedShell>
  );
}
