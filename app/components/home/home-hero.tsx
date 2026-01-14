"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { HomeHexnutScene } from "./home-hexnut-scene";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const smoothSpring = { type: "spring" as const, stiffness: 300, damping: 30 };

export function HomeHero() {
  return (
    <div className="flex flex-col gap-7">
      <motion.div
        className="-mb-4 -ml-4 flex items-end justify-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...smoothSpring, delay: 0 }}
      >
        <HomeHexnutScene />
      </motion.div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-start md:flex-row md:gap-3">
            <motion.h1
              className="text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothSpring, delay: 0 }}
            >
              Tool UI
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...smoothSpring, delay: 0.05 }}
            >
              <Badge
                variant="outline"
                className="text-muted-foreground mt-1 cursor-default font-mono text-xs font-light select-none md:self-end"
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
          transition={{ ...smoothSpring, delay: 0.15 }}
        >
          Beautiful UI components for AI tool calls
        </motion.h2>
      </div>
      <motion.p
        className="text-muted-foreground mb-2 text-lg text-pretty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...smoothSpring, delay: 0.2 }}
      >
        Responsive, accessible, typed, copy-pasteable.{" "}
        <br className="hidden md:block" />
        Built on Tailwind, Radix, and shadcn/ui. Open Source.{" "}
        <br className="hidden md:block" />
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...smoothSpring, delay: 4.5 }}
      >
        <Button asChild className="group font-light tracking-wide" size="homeCTA">
          <Link href="/docs/gallery">
            See the Components
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
