import AppShell from "@/components/app-shell";
import { ResponsiveHeader } from "@/components/responsive-header-server";
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
    <div className="flex h-screen flex-col items-center pt-16">
      <div className="absolute top-0 w-full max-w-[2000px]">
        <ResponsiveHeader rightContent={<HomeViewportControls />} />
      </div>

      <AppShell noScroll>
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
      </AppShell>
    </div>
  );
}
