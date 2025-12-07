import Link from "next/link";
import { DocsBorderedShell } from "@/app/docs/_components/docs-bordered-shell";
import { DataTable } from "@/components/tool-ui/data-table";
import { MediaCard } from "@/components/tool-ui/media-card";
import { XPost } from "@/components/tool-ui/x-post";
import { InstagramPost } from "@/components/tool-ui/instagram-post";
import { LinkedInPost } from "@/components/tool-ui/linkedin-post";
import { OptionList } from "@/components/tool-ui/option-list";
import { presets } from "@/lib/presets/data-table";
import { mediaCardPresets } from "@/lib/presets/media-card";
import { xPostPresets } from "@/lib/presets/x-post";
import { instagramPostPresets } from "@/lib/presets/instagram-post";
import { linkedInPostPresets } from "@/lib/presets/linkedin-post";
import { optionListPresets } from "@/lib/presets/option-list";
import { ArrowRightIcon } from "lucide-react";

export default function ComponentsGalleryPage() {
  return (
    <DocsBorderedShell>
      <div className="scrollbar-subtle z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-10 lg:p-12">
        <div className="mx-auto columns-1 gap-5 pb-20 [column-fill:balance] md:columns-2 2xl:columns-3 2xl:gap-5">
          <div className="mb-5 [column-span:all] 2xl:mb-5">
            <DataTable {...presets.stocks} />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <XPost post={xPostPresets.basic.post} />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <MediaCard {...mediaCardPresets.image.card} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <MediaCard {...mediaCardPresets.video.card} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <div className="w-full">
              <DataTable layout="cards" {...presets.tasks} />
            </div>
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <MediaCard {...mediaCardPresets.link.card} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <MediaCard {...mediaCardPresets.audio.card} maxWidth="100%" />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <InstagramPost post={instagramPostPresets.basic.post} />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <OptionList {...optionListPresets.export.optionList} />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <OptionList {...optionListPresets.travel.optionList} />
          </div>

          <div className="mb-5 break-inside-avoid 2xl:mb-5">
            <LinkedInPost post={linkedInPostPresets.basic.post} />
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
