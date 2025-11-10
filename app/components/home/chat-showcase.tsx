"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DataTable, type Column } from "@/components/data-table";
import type { Stock } from "@/lib/mock-data/stocks";
import { MediaCard, type SerializableMediaCard } from "@/components/media-card";
import {
  SocialPost,
  type SerializableSocialPost,
} from "@/components/social-post";
import {
  DecisionPrompt,
  type DecisionPromptAction,
} from "@/components/decision-prompt";
import { StackedList } from "./stacked-list";

type BubbleProps = {
  role: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
};

function ChatBubble({ role, children, className }: BubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      aria-label={isUser ? "User message" : "Assistant message"}
    >
      <div
        className={cn(
          "relative max-w-[min(720px,100%)]",
          // Text styling
          "text-lg leading-relaxed",
          // User messages: iMessage blue bubble
          isUser && "rounded-full bg-[#007AFF] text-white",
          // Assistant messages: no bubble, just content
          !isUser && "text-foreground",
          // padding varies: text vs embedded UI
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Apple-style motion configuration for smooth, elegant animations
const MOTION = {
  // Sophisticated easing curves
  ease: {
    // Apple's signature ease-out (used for entrances and reveals)
    appleOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
    // Smooth ease-in-out (used for transitions)
    appleMid: [0.42, 0, 0.58, 1] as [number, number, number, number],
    // Gentle expo-out (used for fades and scale)
    soft: [0.19, 1, 0.22, 1] as [number, number, number, number],
    // Standard ease (fallback)
    standard: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
  // Luxurious durations (ms) - slower than typical for elegance
  durations: {
    userIn: 500,
    thinkingIn: 400,
    preambleIn: 280,
    toolIn: 600,
    sceneTransition: 650,
  },
  // Gentle pauses between phases (ms)
  beats: {
    afterUser: 200,
    afterThinking: 120,
    afterPreamble: 100,
  },
  // Scene hold after tool appears (ms)
  sceneHold: 3500,
  // Staggered exit delays (ms) - each item exits slightly after the previous
  exitStagger: {
    user: 0,
    thinking: 80,
    preamble: 160,
    tool: 240,
  },
  // Reduced motion: faster but still pleasant
  reducedMotion: {
    duration: 250,
    sceneHold: 1500,
  },
  // Spring configurations for organic motion
  springs: {
    gentle: { type: "spring" as const, damping: 28, stiffness: 180, mass: 0.8 },
    smooth: { type: "spring" as const, damping: 24, stiffness: 260, mass: 0.8 },
    bouncy: { type: "spring" as const, damping: 20, stiffness: 200, mass: 0.6 },
    snappy: { type: "spring" as const, damping: 30, stiffness: 300, mass: 0.5 },
  },
};

type ThinkingBubbleProps = {
  steps?: string[];
  stepDurationMs?: number;
  reducedMotion?: boolean;
  onComplete?: (elapsedSeconds: number) => void;
};

function ThinkingBubble({
  steps = ["Gathering context…", "Calling tools…", "Processing results…"],
  stepDurationMs = 450, // Slower for more luxurious feel
  reducedMotion,
  onComplete,
}: ThinkingBubbleProps) {
  const [index, setIndex] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState<number | null>(
    reducedMotion ? 1 : null,
  );
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    startRef.current = performance.now();
    let i = 0;
    const timers: number[] = [];
    const max = steps.length;

    const tick = () => {
      if (i < max - 1) {
        i += 1;
        setIndex(i);
        timers.push(window.setTimeout(tick, stepDurationMs));
      } else {
        // Move to final non-shimmer state and freeze elapsed seconds
        const elapsedMs =
          performance.now() - (startRef.current ?? performance.now());
        const secs = Math.max(1, Math.round(elapsedMs / 1000));
        setFinalSeconds(secs);
        onComplete?.(secs);
      }
    };

    timers.push(window.setTimeout(tick, stepDurationMs));

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reducedMotion, stepDurationMs, steps.length, onComplete]);

  const isFinal = finalSeconds != null;

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={MOTION.springs.smooth}
    >
      <ChatBubble role="assistant">
        <div className="text-muted-foreground">
          {isFinal ? (
            `Thought for ${finalSeconds}s`
          ) : (
            <span>{steps[index]}</span>
          )}
        </div>
      </ChatBubble>
    </motion.div>
  );
}

type PreambleBubbleProps = {
  text: string;
  speedMsPerChar?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
};

function PreambleBubble({
  text,
  speedMsPerChar = 38, // Slower for more luxurious, readable feel
  reducedMotion,
  onComplete,
}: PreambleBubbleProps) {
  const [count, setCount] = useState(reducedMotion ? text.length : 0);
  const [visible, setVisible] = useState(reducedMotion);
  const done = count >= text.length;

  // Gentle fade-in before typing starts
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setTimeout(() => setVisible(true), 100);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      onComplete?.();
      return;
    }
    if (!visible) return;

    let i = 0;
    const timers: number[] = [];
    const tick = () => {
      i += 1;
      setCount((c) => Math.min(c + 1, text.length));
      if (i < text.length) {
        timers.push(window.setTimeout(tick, speedMsPerChar));
      } else {
        onComplete?.();
      }
    };
    timers.push(window.setTimeout(tick, speedMsPerChar));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reducedMotion, speedMsPerChar, text.length, onComplete, visible]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={MOTION.springs.smooth}
    >
      <ChatBubble role="assistant">
        <span>
          {text.slice(0, count)}
          {!reducedMotion && <TypingCaret visible={!done} />}
        </span>
      </ChatBubble>
    </motion.div>
  );
}

function TypingCaret({ visible }: { visible: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={visible ? { opacity: [0, 1, 0] } : { opacity: 0 }}
      transition={{
        duration: 1.1,
        ease: "easeInOut",
        repeat: visible ? Infinity : 0,
      }}
      className="ml-1 inline-block h-[1em] w-[2px] bg-current/80"
    />
  );
}

function ToolReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.94,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      transition={MOTION.springs.gentle}
    >
      {children}
    </motion.div>
  );
}

// Custom hook for orchestrating scene timeline phases
function useSceneTimeline({
  reducedMotion,
  onComplete,
  hasUserMessage = true,
}: {
  reducedMotion: boolean;
  onComplete: () => void;
  hasUserMessage?: boolean;
}) {
  const [thinkingStarted, setThinkingStarted] = useState(reducedMotion);
  const [thinkingDone, setThinkingDone] = useState(reducedMotion);
  const [showTool, setShowTool] = useState(reducedMotion);
  const scheduledRef = useRef(false);

  // Handle reduced motion auto-advance
  useEffect(() => {
    if (reducedMotion) {
      const id = window.setTimeout(onComplete, MOTION.reducedMotion.sceneHold);
      return () => window.clearTimeout(id);
    }
  }, [reducedMotion, onComplete]);

  // Start thinking after user message lands (or immediately if no user message)
  useEffect(() => {
    if (reducedMotion || thinkingStarted) return;
    const delay = hasUserMessage
      ? MOTION.durations.userIn + MOTION.beats.afterUser
      : 0;
    const id = window.setTimeout(() => setThinkingStarted(true), delay);
    return () => window.clearTimeout(id);
  }, [thinkingStarted, reducedMotion, hasUserMessage]);

  // Auto-advance scene after tool is shown
  useEffect(() => {
    if (!scheduledRef.current && thinkingDone && showTool && !reducedMotion) {
      scheduledRef.current = true;
      const id = window.setTimeout(onComplete, MOTION.sceneHold);
      return () => window.clearTimeout(id);
    }
  }, [thinkingDone, showTool, onComplete, reducedMotion]);

  return useMemo(
    () => ({
      thinkingStarted,
      thinkingDone,
      showTool,
      setThinkingDone,
      setShowTool,
    }),
    [thinkingStarted, thinkingDone, showTool],
  );
}

// Scene configuration type
type SceneConfig = {
  userMessage?: string;
  thinkingSteps: string[];
  preamble?: string;
  toolUI: React.ReactNode;
  toolFallbackHeight?: number;
};

// Abstract scene component that handles the common animation pattern
function AnimatedScene({
  config,
  reducedMotion,
  onComplete,
  sceneId,
  isExiting = false,
}: {
  config: SceneConfig;
  reducedMotion: boolean;
  onComplete: () => void;
  sceneId: string;
  isExiting?: boolean;
}) {
  const timeline = useSceneTimeline({
    reducedMotion,
    onComplete,
    hasUserMessage: !!config.userMessage,
  });

  // Use refs to keep callbacks stable across renders
  const handleThinkingCompleteRef = useRef(() => {
    timeline.setThinkingDone(true);
  });
  const handlePreambleCompleteRef = useRef(() => {
    timeline.setShowTool(true);
  });

  // Update refs when timeline changes
  useEffect(() => {
    handleThinkingCompleteRef.current = () => timeline.setThinkingDone(true);
    handlePreambleCompleteRef.current = () => timeline.setShowTool(true);
  }, [timeline]);

  // Stable callback wrappers
  const handleThinkingComplete = useCallback(() => {
    handleThinkingCompleteRef.current();
  }, []);

  const handlePreambleComplete = useCallback(() => {
    handlePreambleCompleteRef.current();
  }, []);

  const items = [
    // User message (if provided)
    ...(config.userMessage
      ? [
          {
            id: `${sceneId}-user`,
            node: (
              <ChatBubble role="user" className="px-6 py-3">
                {config.userMessage}
              </ChatBubble>
            ),
            fallbackHeight: 64,
            enterDurationMs: MOTION.durations.userIn,
            enterDelayMs: 80,
            exitDelayMs: MOTION.exitStagger.user,
          },
        ]
      : []),
    // Thinking bubble
    ...(timeline.thinkingStarted
      ? [
          {
            id: `${sceneId}-thinking`,
            node: (
              <ThinkingBubble
                steps={config.thinkingSteps}
                reducedMotion={reducedMotion}
                onComplete={handleThinkingComplete}
              />
            ),
            fallbackHeight: 56,
            enterDurationMs: MOTION.durations.thinkingIn,
            enterDelayMs: 100,
            exitDelayMs: MOTION.exitStagger.thinking,
          },
        ]
      : []),
    // Preamble (if provided)
    ...(timeline.thinkingDone && config.preamble
      ? [
          {
            id: `${sceneId}-preamble`,
            node: (
              <PreambleBubble
                text={config.preamble}
                reducedMotion={reducedMotion}
                onComplete={handlePreambleComplete}
              />
            ),
            fallbackHeight: 56,
            enterDurationMs: MOTION.durations.preambleIn,
            enterDelayMs: MOTION.beats.afterThinking,
            exitDelayMs: MOTION.exitStagger.preamble,
          },
        ]
      : []),
    // Tool UI
    ...(timeline.thinkingDone && (config.preamble ? timeline.showTool : true)
      ? [
          {
            id: `${sceneId}-tool`,
            node: (
              <div className="flex w-full justify-start">
                <div className="w-full max-w-[720px] *:[&_[data-slot=table]]:min-w-0">
                  <ToolReveal>{config.toolUI}</ToolReveal>
                </div>
              </div>
            ),
            fallbackHeight: config.toolFallbackHeight ?? 280,
            enterDurationMs: MOTION.durations.toolIn,
            enterDelayMs: config.preamble
              ? MOTION.beats.afterPreamble
              : MOTION.beats.afterThinking,
            exitDelayMs: MOTION.exitStagger.tool,
          },
        ]
      : []),
  ];

  // Trigger setShowTool if no preamble
  useEffect(() => {
    if (!config.preamble && timeline.thinkingDone && !timeline.showTool) {
      timeline.setShowTool(true);
    }
  }, [
    config.preamble,
    timeline.thinkingDone,
    timeline.showTool,
    timeline.setShowTool,
  ]);

  // When exiting, clear items to trigger exit animations
  const displayItems = isExiting ? [] : items;

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 pr-3">
      <StackedList items={displayItems} gap={12} />
    </div>
  );
}

export function ChatShowcase() {
  // Reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  // DataTable setup
  const tableColumns: Column<Stock>[] = useMemo(
    () => [
      { key: "symbol", label: "Symbol", sortable: true, priority: "primary" },
      { key: "name", label: "Company", sortable: true, priority: "primary" },
      {
        key: "price",
        label: "Price",
        sortable: true,
        align: "right",
        priority: "primary",
        format: { kind: "currency", currency: "USD", decimals: 2 },
      },
      {
        key: "changePercent",
        label: "Change %",
        sortable: true,
        align: "right",
        priority: "secondary",
        format: { kind: "percent", decimals: 2, showSign: true, basis: "unit" },
      },
    ],
    [],
  );

  const tableData: Stock[] = useMemo(
    () => [
      {
        symbol: "NVDA",
        name: "NVIDIA",
        price: 875.45,
        change: 12.8,
        changePercent: 0.0148,
        volume: 52341200,
        marketCap: 2160000000000,
        pe: 68.4,
        eps: 12.8,
      },
      {
        symbol: "MSFT",
        name: "Microsoft",
        price: 378.91,
        change: 4.25,
        changePercent: 0.0113,
        volume: 22451800,
        marketCap: 2810000000000,
        pe: 35.2,
        eps: 10.76,
      },
      {
        symbol: "META",
        name: "Meta",
        price: 485.32,
        change: 8.92,
        changePercent: 0.0187,
        volume: 18923400,
        marketCap: 1230000000000,
        pe: 28.6,
        eps: 16.97,
      },
    ],
    [],
  );

  // MediaCard setup
  const mediaCard: SerializableMediaCard = useMemo(
    () => ({
      id: "media-card-link",
      kind: "link",
      href: "https://assistant-ui.com/blog/tool-ui-patterns",
      src: "https://assistant-ui.com/blog/tool-ui-patterns",
      title: "Designing tool-friendly media cards",
      description:
        "How to structure robust previews for images, video, audio, and streaming tool output.",
      ratio: "16:9",
      domain: "assistant-ui.com",
      thumb:
        "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?auto=format&fit=crop&q=80&w=1200",
      createdAtISO: "2025-02-05T09:45:00.000Z",
      source: {
        label: "Docs generator",
        iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=docs",
        url: "https://assistant-ui.com",
      },
      og: {
        imageUrl:
          "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?auto=format&fit=crop&q=80&w=1200",
        description: "Guidance for building resilient tool surfaces.",
        title: "Designing tool-friendly media cards",
      },
    }),
    [],
  );

  // SocialPost setup
  const socialPost: SerializableSocialPost = useMemo(
    () => ({
      id: "x-draft-1",
      platform: "x",
      author: {
        name: "Ariandel Osorio",
        handle: "ariandelosorio",
        avatarUrl:
          "https://images.unsplash.com/photo-1741336649605-7717819d4b5e?auto=format&fit=crop&q=80&w=1200",
      },
      text: "The AI boom is reshaping tech markets. NVDA up 68% P/E, META leading with 1.87% gains. This week's newsletter breaks down what it means for the industry 👇",
      createdAtISO: "2025-11-05T09:15:00.000Z",
      language: "en-US",
    }),
    [],
  );

  // DecisionPrompt setup
  const decisionActions: DecisionPromptAction[] = useMemo(
    () => [
      { id: "cancel", label: "Cancel", variant: "ghost" },
      { id: "edit", label: "Edit Post", variant: "outline" },
      { id: "send", label: "Accept and Post", variant: "default" },
    ],
    [],
  );

  // Scene configurations
  const sceneConfigs: SceneConfig[] = useMemo(
    () => [
      // Scene 1: Stocks / DataTable
      {
        userMessage: "Show me the latest performance for the major AI players.",
        thinkingSteps: [
          "Searching for recent stock prices…",
          "Fetching data…",
          "Analyzing changes…",
        ],
        preamble: "Here are the top stocks I found:",
        toolUI: (
          <DataTable<Stock>
            rowIdKey="symbol"
            columns={tableColumns}
            data={tableData}
          />
        ),
        toolFallbackHeight: 320,
      },
      // Scene 2: Media / MediaCard
      {
        userMessage: "Pull a good article preview I can include.",
        thinkingSteps: [
          "Finding an article…",
          "Checking metadata…",
          "Preparing preview…",
        ],
        preamble: "Here's a preview:",
        toolUI: <MediaCard {...mediaCard} maxWidth="420px" />,
        toolFallbackHeight: 260,
      },
      // Scene 3: Social / SocialPost + DecisionPrompt
      {
        userMessage: "Draft an X post to promote the issue.",
        thinkingSteps: [
          "Drafting a post…",
          "Linking references…",
          "Polishing copy…",
        ],
        preamble: "Here's a draft:",
        toolUI: (
          <div className="w-full max-w-[600px] min-w-0 space-y-3">
            <SocialPost {...socialPost} className="w-full" maxWidth="100%" />
            <DecisionPrompt
              prompt="What would you like to do with this post?"
              actions={decisionActions}
              align="left"
              layout="inline"
            />
          </div>
        ),
        toolFallbackHeight: 480,
      },
    ],
    [tableColumns, tableData, mediaCard, socialPost, decisionActions],
  );

  // Scene switching with exit control
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneRunId, setSceneRunId] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const nextScene = useCallback(() => {
    // Trigger exit animations
    setIsExiting(true);
    // Wait for staggered exits to complete, then switch scene
    const exitDuration = reducedMotion
      ? MOTION.reducedMotion.duration
      : MOTION.exitStagger.tool + 500; // Last item delay + spring settle time
    setTimeout(() => {
      setIsExiting(false);
      setSceneIndex((i) => (i + 1) % 3);
      setSceneRunId((id) => id + 1);
    }, exitDuration);
  }, [reducedMotion]);

  // Render
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        aria-hidden="true"
      />
      <div className="relative z-10 h-full min-h-0 w-full">
        <motion.div
          key={`scene-${sceneIndex}-${sceneRunId}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={MOTION.springs.smooth}
        >
          <AnimatedScene
            config={sceneConfigs[sceneIndex]}
            reducedMotion={reducedMotion}
            onComplete={nextScene}
            sceneId={`scene-${sceneIndex}`}
            isExiting={isExiting}
          />
        </motion.div>
      </div>
    </div>
  );
}
