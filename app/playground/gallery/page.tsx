import { DataTable } from "@/components/registry/data-table";
import { MediaCard } from "@/components/registry/media-card";
import { SocialPost } from "@/components/registry/social-post";
import { sampleStocks, sampleTasks } from "@/lib/sample-data";
import { mediaCardPresets } from "@/lib/media-card-presets";
import { sampleX } from "@/lib/social-post-presets";

export default function PlaygroundGalleryPage() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 p-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground">
            Preview featured ToolUI components across desktop and mobile
            layouts.
          </p>
        </header>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">Data Tables</h2>
            <p className="text-sm text-muted-foreground">
              Compare responsive behavior between full-width and mobile
              viewports.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between text-sm font-medium">
                <span>Desktop preview</span>
                <span className="text-muted-foreground">Fluid width</span>
              </div>
              <div className="overflow-x-auto rounded-lg bg-background p-4 shadow-xs">
                <DataTable {...sampleStocks} />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between text-sm font-medium">
                <span>Mobile preview</span>
                <span className="text-muted-foreground">375px</span>
              </div>
              <div className="flex justify-center overflow-x-auto rounded-lg bg-background p-4 shadow-xs">
                <div className="w-full max-w-[375px]">
                  <DataTable {...sampleTasks} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">Social Post</h2>
            <p className="text-sm text-muted-foreground">
              A rich X post with quoted content and engagement details.
            </p>
          </div>
          <div className="mx-auto max-w-xl">
            <SocialPost {...sampleX.post} maxWidth="100%" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">Media Cards</h2>
            <p className="text-sm text-muted-foreground">
              Image, video, audio, and link previews designed for chat surfaces.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="text-sm font-medium">Image</div>
              <div className="mt-4">
                <MediaCard {...mediaCardPresets.image.card} maxWidth="420px" />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Video</div>
              <div className="mt-4">
                <MediaCard {...mediaCardPresets.video.card} maxWidth="420px" />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Audio</div>
              <div className="mt-4">
                <MediaCard {...mediaCardPresets.audio.card} maxWidth="420px" />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Link</div>
              <div className="mt-4">
                <MediaCard {...mediaCardPresets.link.card} maxWidth="420px" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
