import ContentLayout from "@/app/components/content-layout";
import { HeaderFrame } from "@/app/components/header-frame";
import { HomeHero } from "@/app/components/home/home-hero";
import { HomeViewportControls } from "@/app/components/home/home-viewport-controls";
import { HomeDebugPanel } from "@/app/components/home/home-debug-panel";
import { ChatShowcase } from "@/app/components/home/chat-showcase";

type HomePageProps = {
  searchParams?: {
    logoDebug?: string;
  };
};

export default function HomePage({
  searchParams: _searchParams,
}: {
  searchParams?: HomePageProps["searchParams"];
}) {
  return (
    <HeaderFrame
      rightContent={<HomeViewportControls showViewportButtons={false} />}
      background={
        <div
          className="bg-background bg-dot-grid pointer-events-none fixed inset-0 opacity-60 dark:opacity-40"
          aria-hidden="true"
        />
      }
    >
      <ContentLayout noScroll>
        <main className="relative h-full max-h-[800px] min-h-0 w-full max-w-[2000px] overflow-hidden flex flex-col gap-10 md:p-6 lg:flex-row">
          <div className="relative z-10 flex w-full flex-col justify-end overflow-y-auto pb-[8vh] pl-6 lg:grow-0 lg:shrink lg:basis-[33vw] lg:min-w-[320px] lg:max-w-[33vw]">
            <HomeHero />
          </div>

          <div className="relative hidden h-full min-h-0 w-full min-w-0 items-center lg:flex lg:flex-1">
            <div className="h-[600px] w-full">
              <ChatShowcase />
            </div>
          </div>
        </main>
        <HomeDebugPanel />
      </ContentLayout>
    </HeaderFrame>
  );
}
