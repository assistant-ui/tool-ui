import ContentLayout from "@/components/content-layout";
import { HeaderFrame } from "@/components/header-frame";
import { HomeHero } from "@/components/home/home-hero";
import {
  HomeClient,
  HomeDebugPanel,
  HomeViewportControls,
} from "@/components/home/home-client";

type HomePageProps = {
  searchParams?: {
    logoDebug?: string;
  };
};

export default function HomePage({
  searchParams,
}: {
  searchParams?: HomePageProps["searchParams"];
}) {
  const showLogoDebug = searchParams?.logoDebug === "true";

  return (
    <HeaderFrame rightContent={<HomeViewportControls />}>
      <ContentLayout noScroll>
        <main className="bg-background relative grid h-full max-h-[800px] min-h-0 max-w-[1400px] grid-cols-1 gap-10 overflow-hidden md:grid-cols-[2fr_3fr] md:p-6">
          <div
            className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
            aria-hidden="true"
          />
          <div className="relative z-10 flex max-w-2xl shrink-0 flex-col justify-end gap-7 overflow-y-auto pb-[8vh] pl-6">
            <HomeHero />
          </div>
          <HomeClient showLogoDebug={showLogoDebug} />
          <HomeDebugPanel />
        </main>
      </ContentLayout>
    </HeaderFrame>
  );
}
