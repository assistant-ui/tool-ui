"use client";

import ContentLayout from "@/app/components/layout/page-shell";
import { HeaderFrame } from "@/app/components/layout/app-shell";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { HomeHero } from "@/app/components/home/home-hero";
import { FauxChatShellAnimated } from "@/app/components/home/faux-chat-shell-animated";
import { motion } from "motion/react";

const smoothSpring = { type: "spring" as const, stiffness: 300, damping: 30 };

export default function HomePage() {
  return (
    <HeaderFrame
      rightContent={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...smoothSpring, delay: 0.6 }}
        >
          <ThemeToggle />
        </motion.div>
      }
      background={
        <motion.div
          className="bg-background pointer-events-none fixed inset-0 opacity-60 dark:opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
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
            className="squircle relative hidden h-full min-h-0 w-full min-w-0 items-center justify-center lg:flex lg:flex-1"
          >
            <div className="h-full w-full max-w-[800px]">
              <FauxChatShellAnimated />
            </div>
          </div>
        </main>
      </ContentLayout>
    </HeaderFrame>
  );
}
