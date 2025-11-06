import { DataTable } from "@/components/registry/data-table";
import { SocialPost } from "@/components/registry/social-post";
import { sampleStocks, sampleTasks } from "@/lib/sample-data";
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

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-4 shadow-xs">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Desktop preview</span>
                <span className="text-muted-foreground">Fluid width</span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <DataTable {...sampleStocks} />
              </div>
            </div>

            <div className="rounded-lg border bg-background p-4 shadow-xs">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Mobile preview</span>
                <span className="text-muted-foreground">375px</span>
              </div>
              <div className="mt-4 flex justify-center overflow-x-auto">
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
          <div className="rounded-lg border bg-background p-4 shadow-xs">
            <div className="mx-auto max-w-xl">
              <SocialPost {...sampleX.post} maxWidth="100%" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
