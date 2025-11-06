import { DataTable } from "@/components/registry/data-table";
import { MediaCard } from "@/components/registry/media-card";
import { SocialPost } from "@/components/registry/social-post";
import { DecisionPrompt } from "@/components/registry/decision-prompt";
import {
  sampleStocks,
  sampleTasks,
  sampleMetrics,
  sampleResources,
} from "@/lib/sample-data";
import { mediaCardPresets } from "@/lib/media-card-presets";
import {
  sampleX,
  sampleInstagram,
  sampleLinkedIn,
} from "@/lib/social-post-presets";
import { decisionPromptPresets } from "@/lib/decision-prompt-presets";

export default function ComponentsGalleryPage() {
  return (
    <div className="flex flex-1 min-h-0">
      <div className="bg-background shadow-crisp-edge scrollbar-subtle flex min-h-0 flex-1 items-start justify-center overflow-auto rounded-lg p-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="columns-1 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          <div className="mb-6 [column-span:all]">
            <div className="bg-background overflow-x-auto rounded-lg p-4 shadow-xs">
              <DataTable {...sampleStocks} />
            </div>
          </div>

          <div className="mb-6 break-inside-avoid">
            <SocialPost {...sampleX.post} maxWidth="100%" />
          </div>

          <div className="mb-6 break-inside-avoid">
            <MediaCard {...mediaCardPresets.image.card} maxWidth="100%" />
          </div>

          <div className="mb-6 break-inside-avoid">
            <div className="bg-background overflow-x-auto rounded-lg p-4 shadow-xs">
              <div className="w-full">
                <DataTable {...sampleTasks} />
              </div>
            </div>
          </div>

          <div className="mb-6 break-inside-avoid">
            <DecisionPrompt {...decisionPromptPresets.binary.prompt} />
          </div>

          <div className="mb-6 break-inside-avoid">
            <MediaCard {...mediaCardPresets.video.card} maxWidth="100%" />
          </div>

          <div className="mb-6 break-inside-avoid">
            <SocialPost {...sampleLinkedIn.post} maxWidth="100%" />
          </div>

          <div className="mb-6 break-inside-avoid">
            <div className="bg-background overflow-x-auto rounded-lg p-4 shadow-xs">
              <div className="w-full">
                <DataTable {...sampleMetrics} />
              </div>
            </div>
          </div>

          <div className="mb-6 break-inside-avoid">
            <MediaCard {...mediaCardPresets.link.card} maxWidth="100%" />
          </div>

          <div className="mb-6 break-inside-avoid">
            <DecisionPrompt {...decisionPromptPresets.destructive.prompt} />
          </div>

          <div className="mb-6 break-inside-avoid">
            <div className="bg-background overflow-x-auto rounded-lg p-4 shadow-xs">
              <div className="w-full">
                <DataTable {...sampleResources} />
              </div>
            </div>
          </div>

          <div className="mb-6 break-inside-avoid">
            <MediaCard {...mediaCardPresets.audio.card} maxWidth="100%" />
          </div>

          <div className="mb-6 break-inside-avoid">
            <SocialPost {...sampleInstagram.post} maxWidth="100%" />
          </div>

          <div className="mb-6 break-inside-avoid">
            <DecisionPrompt {...decisionPromptPresets["multi-choice"].prompt} />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
