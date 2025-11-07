import { DataTable } from "@/components/registry/data-table";
import { MediaCard } from "@/components/registry/media-card";
import { SocialPost } from "@/components/registry/social-post";
import { DecisionPrompt } from "@/components/registry/decision-prompt";
import { sampleStocks, sampleMetrics } from "@/lib/sample-data";
import { mediaCardPresets } from "@/lib/media-card-presets";
import {
  sampleX,
  sampleInstagram,
  sampleLinkedIn,
} from "@/lib/social-post-presets";
import { decisionPromptPresets } from "@/lib/decision-prompt-presets";

export default function ComponentsGalleryPage() {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="bg-background scrollbar-subtle flex min-h-0 flex-1 items-start justify-center overflow-auto rounded-lg rounded-tl-lg border-t border-l p-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="columns-1 gap-6 [column-fill:_balance] md:columns-2 lg:gap-10 xl:columns-3">
            <div className="mb-6 [column-span:all] lg:mb-10">
              <DataTable {...sampleStocks} />
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <SocialPost {...sampleX.post} maxWidth="100%" />
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <MediaCard {...mediaCardPresets.image.card} maxWidth="100%" />
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <MediaCard {...mediaCardPresets.video.card} maxWidth="100%" />
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <div className="w-full">
                <DataTable {...sampleMetrics} />
              </div>
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <MediaCard {...mediaCardPresets.link.card} maxWidth="100%" />
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <DecisionPrompt {...decisionPromptPresets.destructive.prompt} />
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <SocialPost {...sampleLinkedIn.post} maxWidth="100%" />
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <MediaCard {...mediaCardPresets.audio.card} maxWidth="100%" />
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <SocialPost {...sampleInstagram.post} maxWidth="100%" />
            </div>

            <div className="mb-6 break-inside-avoid lg:mb-10">
              <DecisionPrompt
                {...decisionPromptPresets["multi-choice"].prompt}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
