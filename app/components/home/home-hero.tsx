"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { HomeHexnutScene } from "./home-hexnut-scene";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const smoothSpring = {
  type: "spring" as const,
  stiffness: 200,
  damping: 40,
  duration: 0.8,
  restDelta: 0.0001,
};

const preloadGallery = () => {
  if (typeof window !== "undefined") {
    void import("@/app/docs/gallery/page");
  }
};

export function HomeHero() {
  return (
    <div className="flex flex-col gap-7">
      <motion.div
        className="-mb-4 -ml-4 flex items-end justify-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...smoothSpring, delay: 0.1 }}
      >
        <HomeHexnutScene />
      </motion.div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-start md:flex-row md:items-end md:gap-3">
            <motion.h1
              className="text-6xl font-bold tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothSpring, delay: 0.1 }}
            >
              Tool UI
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothSpring, delay: 0.2 }}
            >
              <Badge
                variant="outline"
                className="text-muted-foreground mt-1 cursor-default bg-background/50 font-mono text-xs font-light backdrop-blur-md select-none md:mt-0 md:mb-1"
              >
                research preview
              </Badge>
            </motion.div>
          </div>
        </div>
        <motion.h2
          className="text-2xl text-pretty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.3 }}
        >
          UI components for AI interfaces
        </motion.h2>
      </div>
      <motion.p
        className="text-muted-foreground mb-2 text-lg text-pretty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...smoothSpring, delay: 0.4 }}
      >
        JSON-native, typed, accessible, copy-pasteable.{" "}
        <br className="hidden md:block" />
        Built on Tailwind, Radix, and shadcn/ui. Open Source.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...smoothSpring, delay: 0.5 }}
      >
        <Button asChild className="group font-medium tracking-wide" size="homeCTA">
          <Link
            href="/docs/gallery"
            onMouseEnter={preloadGallery}
            onFocus={preloadGallery}
          >
            See the Components
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
