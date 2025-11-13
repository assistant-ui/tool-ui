import Link from "next/link";
import { DocsBorderedShell } from "@/app/docs/_components/docs-bordered-shell";
import { DataTable } from "@/components/data-table";
import { MediaCard } from "@/components/media-card";
import { SocialPost } from "@/components/social-post";
import { DecisionPrompt } from "@/components/decision-prompt";
import { ZenField } from "@/app/components/zen-field";
import { sampleStocks, sampleMetrics } from "@/lib/sample-data";
import { mediaCardPresets } from "@/lib/media-card-presets";
import {
  sampleX,
  sampleInstagram,
  sampleLinkedIn,
} from "@/lib/social-post-presets";
import { decisionPromptPresets } from "@/lib/decision-prompt-presets";
import { ArrowRightIcon } from "lucide-react";

export default function ComponentsGalleryPage() {
  return (
    <DocsBorderedShell>
      <ZenField className="z-0 dark:opacity-10 dark:contrast-200" />
      <div className="scrollbar-subtle z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-10 lg:p-12">
        <div className="mx-auto columns-1 gap-5 pb-20 [column-fill:_balance] md:columns-2 2xl:columns-3 2xl:gap-5">
          <div className="mb-5 [column-span:all] 2xl:mb-5">
            <DataTable {...sampleStocks} />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <SocialPost {...sampleX.post} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <MediaCard {...mediaCardPresets.image.card} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <MediaCard {...mediaCardPresets.video.card} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <div className="w-full">
              <DataTable layout="cards" {...sampleMetrics} />
            </div>
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <MediaCard {...mediaCardPresets.link.card} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <MediaCard {...mediaCardPresets.audio.card} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <SocialPost {...sampleInstagram.post} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <DecisionPrompt {...decisionPromptPresets.destructive.prompt} />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <DecisionPrompt {...decisionPromptPresets["multi-choice"].prompt} />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <SocialPost {...sampleLinkedIn.post} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <Link
              href="/builder"
              className="bg-foreground/5 text-muted-foreground bg-dot-grid hover:text-foreground hover:bg-primary/7 group flex min-h-[180px] w-full flex-row items-center justify-center gap-2 rounded-2xl p-6 text-center shadow-[inset_0_6px_20px_rgba(0,0,0,0.09)] transition-colors duration-300"
            >
              <span className="text-primary text-2xl font-light tracking-wide transition-transform duration-600 will-change-transform group-hover:scale-105">
                Build your own tool UI
              </span>
              <ArrowRightIcon className="size-6 shrink-0 transition-transform duration-600 will-change-transform group-hover:translate-x-3 group-hover:scale-105" />
            </Link>
          </div>
        </div>
      </div>
    </DocsBorderedShell>
  );
}
