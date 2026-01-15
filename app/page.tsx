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
      animateNavbar={true}
      background={
        <>
          <motion.div
            className="bg-background pointer-events-none fixed inset-0 opacity-60 dark:opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            aria-hidden="true"
          />
          {/* Device shell positioned relative to HeaderFrame so it can extend into header */}
          <div className="squircle pointer-events-none absolute inset-0 top-[60px] flex items-end justify-center md:top-0 md:items-center lg:right-0 lg:left-auto lg:w-1/2">
            <div className="block h-full w-full max-w-[430px] translate-y-[52px] translate-x-[45%] scale-[0.7] md:translate-x-0 md:translate-y-0 md:scale-100 lg:hidden">
              <FauxChatShellMobileAnimated />
            </div>
            <div className="hidden h-full w-full lg:block">
              <FauxChatShellAnimated />
            </div>
          </div>
        </>
      }
    >
      <ContentLayout>
        <main className="relative flex h-full max-h-[800px] min-h-0 w-full max-w-[1440px] flex-col justify-end gap-10 overflow-x-clip md:p-6 lg:flex-row">
          <div className="relative z-10 flex w-full max-w-[500px] flex-col justify-end pb-[18px] pl-6 md:pb-[10vh] lg:max-w-[40w] lg:min-w-[400x] lg:shrink lg:grow-0 lg:basis-[40w]">
            <HomeHero />
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[5] md:hidden"
            style={{
              background: "linear-gradient(to top, var(--color-background) 0%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          {/* Spacer for desktop layout */}
          <div className="hidden lg:flex lg:flex-1" />
        </main>
      </ContentLayout>
    </HeaderFrame>
  );
}
