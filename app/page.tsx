"use client";

import ContentLayout from "@/app/components/layout/page-shell";
import { HeaderFrame } from "@/app/components/layout/app-shell";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { HomeHero } from "@/app/components/home/home-hero";
import { FauxChatShellMobileAnimated } from "@/app/components/home/faux-chat-shell-mobile-animated";
import { FauxChatShellAnimated } from "@/app/components/home/faux-chat-shell-animated";
import { motion } from "motion/react";

export default function HomePage() {
  return (
    <HeaderFrame
      rightContent={<ThemeToggle />}
      background={
        <motion.div
          className="bg-background pointer-events-none fixed inset-0 opacity-60 dark:opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          aria-hidden="true"
        />
      }
    >
      <ContentLayout>
        <main className="relative flex h-full max-h-[800px] min-h-0 w-full max-w-[1440px] flex-col justify-end gap-10 md:p-6 lg:flex-row">
          <div className="relative z-10 flex w-full max-w-[500px] flex-col justify-end overflow-y-auto pb-[10vh] pl-6 lg:max-w-[40w] lg:min-w-[400x] lg:shrink lg:grow-0 lg:basis-[40w]">
            <HomeHero />
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[5] md:hidden"
            style={{
              background: "linear-gradient(to top, var(--color-background) 0%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          <div
            className="squircle absolute inset-0 flex h-full min-h-0 w-full min-w-0 -translate-y-12 translate-x-1/4 scale-[0.7] items-center justify-end md:translate-x-0 md:translate-y-0 md:scale-100 md:justify-center lg:relative lg:flex-1"
          >
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
