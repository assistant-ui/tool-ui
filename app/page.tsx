"use client";

import ContentLayout from "@/app/components/layout/page-shell";
import { HeaderFrame } from "@/app/components/layout/app-shell";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { HomeHero } from "@/app/components/home/home-hero";
import { FauxChatShellMobileAnimated } from "@/app/components/home/faux-chat-shell-mobile-animated";
import { FauxChatShellAnimated } from "@/app/components/home/faux-chat-shell-animated";

export default function HomePage() {
  return (
    <HeaderFrame
      rightContent={<ThemeToggle />}
      animateNavbar={true}
      background={
        <>
          <div
            className="bg-background pointer-events-none fixed inset-0 opacity-60 dark:opacity-40"
            style={{ animation: "fade-in 0.6s ease-out forwards" }}
            aria-hidden="true"
          />
          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </>
      }
    >
      <ContentLayout>
        <main className="relative flex h-full max-h-[800px] min-h-0 w-full max-w-[1440px] flex-col justify-end gap-10 overflow-x-clip md:p-6 lg:flex-row">
          <div className="relative z-10 flex w-full max-w-[500px] flex-col justify-end pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pl-6 md:pb-[10vh] lg:max-w-[40w] lg:min-w-[400x] lg:shrink lg:grow-0 lg:basis-[40w]">
            <HomeHero />
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[5] md:hidden"
            style={{
              background:
                "linear-gradient(to top, var(--color-background) 0%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex h-full min-h-0 w-full min-w-0 translate-x-[45%] -translate-y-12 scale-[0.7] items-center justify-end sm:translate-x-[10%] sm:scale-[0.85] md:translate-x-0 md:translate-y-0 md:scale-100 lg:relative lg:flex-1 lg:justify-center">
            <div className="block h-full w-full max-w-[430px] lg:hidden">
              <FauxChatShellMobileAnimated />
            </div>
            <div className="hidden h-full w-full lg:block">
              <FauxChatShellAnimated />
            </div>
          </div>
        </main>
      </ContentLayout>
    </HeaderFrame>
  );
}
