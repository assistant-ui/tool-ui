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
        <main className="relative grid h-full max-h-[800px] min-h-0 w-full max-w-[2000px] grid-cols-1 gap-10 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-6">
          <div className="relative z-10 flex max-w-[600px] min-w-[500px] flex-col justify-end overflow-y-auto pb-[8vh] pl-6">
            <HomeHero />
          </div>

          <div className="relative hidden h-full min-h-0 w-full min-w-0 items-center lg:flex">
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
