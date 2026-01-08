import type { Metadata } from "next";

import { DocsBorderedShell } from "@/app/docs/_components/docs-bordered-shell";
import { ApprovalCard } from "@/components/tool-ui/approval-card";
import { CitationList } from "@/components/tool-ui/citation";
import { DataTable } from "@/components/tool-ui/data-table";
import { Image } from "@/components/tool-ui/image";
import { ImageGallery } from "@/components/tool-ui/image-gallery";
import { Video } from "@/components/tool-ui/video";
import { Audio } from "@/components/tool-ui/audio";
import { LinkPreview } from "@/components/tool-ui/link-preview";
import { XPost } from "@/components/tool-ui/x-post";
import { LinkedInPost } from "@/components/tool-ui/linkedin-post";
import { OptionList } from "@/components/tool-ui/option-list";
import { OrderSummary } from "@/components/tool-ui/order-summary";
import { Plan } from "@/components/tool-ui/plan";
import { Terminal } from "@/components/tool-ui/terminal";
import { CodeBlock } from "@/components/tool-ui/code-block";
import { Chart } from "@/components/tool-ui/chart";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import { approvalCardPresets } from "@/lib/presets/approval-card";
import { citationPresets } from "@/lib/presets/citation";
import { dataTablePresets } from "@/lib/presets/data-table";
import { itemCarouselPresets } from "@/lib/presets/item-carousel";
import { imagePresets } from "@/lib/presets/image";
import { imageGalleryPresets } from "@/lib/presets/image-gallery";
import { videoPresets } from "@/lib/presets/video";
import { audioPresets } from "@/lib/presets/audio";
import { linkPreviewPresets } from "@/lib/presets/link-preview";
import { xPostPresets } from "@/lib/presets/x-post";
import { linkedInPostPresets } from "@/lib/presets/linkedin-post";
import { optionListPresets } from "@/lib/presets/option-list";
import { orderSummaryPresets } from "@/lib/presets/order-summary";
import { planPresets } from "@/lib/presets/plan";
import { terminalPresets } from "@/lib/presets/terminal";
import { codeBlockPresets } from "@/lib/presets/code-block";
import { chartPresets } from "@/lib/presets/chart";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse all Tool UI components in a visual gallery",
};

export default function ComponentsGalleryPage() {
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
            <XPost post={xPostPresets.basic.data.post} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <Image {...imagePresets["with-source"].data.image} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <ImageGallery {...imageGalleryPresets["search-results"].data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <Video {...videoPresets["with-poster"].data.video} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <DataTable layout="cards" {...dataTablePresets.tasks.data} />
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
            <OptionList {...optionListPresets.travel.data} />
          </div>

          <div className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5">
            <LinkedInPost post={linkedInPostPresets.basic.data.post} />
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
