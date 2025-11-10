"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DataTable, type Column } from "@/components/data-table";
import { MediaCard, type SerializableMediaCard } from "@/components/media-card";

// Support ticket type for DataTable demo
type SupportTicket = {
  id: string;
  customer: string;
  issue: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in-progress" | "waiting" | "done";
  assignee: string;
  created: string;
};
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
    afterUser: 700,
    afterThinking: 500,
    afterPreamble: 200,
  },
  // Scene hold after tool appears (ms)
  sceneHold: 4500,
  // Staggered exit delays (ms) - each item exits slightly after the previous
  exitStagger: {
    user: 0,
    thinking: 80,
    preamble: 120,
    tool: 180,
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
      className="-mb-[2px] ml-1 inline-block h-[1em] w-[2px] bg-current/80"
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
            animationType: "fade" as const,
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
            animationType: "fade" as const,
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
  // DataTable setup - Support Tickets
  const tableColumns: Column<SupportTicket>[] = useMemo(
    () => [
      { key: "id", label: "ID", sortable: true, priority: "primary" },
      { key: "issue", label: "Issue", sortable: false, priority: "primary" },
      {
        key: "priority",
        label: "Priority",
        sortable: true,
        priority: "primary",
        format: {
          kind: "badge",
          colorMap: {
            high: "danger",
            medium: "warning",
            low: "success",
          } as Record<
            string,
            "danger" | "warning" | "info" | "success" | "neutral"
          >,
        },
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        priority: "primary",
        format: {
          kind: "badge",
          colorMap: {
            "in-progress": "info",
            open: "warning",
            waiting: "neutral",
            done: "success",
          } as Record<
            string,
            "danger" | "warning" | "info" | "success" | "neutral"
          >,
        },
      },
    ],
    [],
  );

  const tableData: SupportTicket[] = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const tickets: SupportTicket[] = [
      {
        id: "TKT-2847",
        customer: "Acme Corp",
        issue: "API authentication failing intermittently",
        priority: "high",
        status: "in-progress",
        assignee: "Sarah Chen",
        created: "2h ago",
      },
      {
        id: "TKT-2839",
        customer: "TechStart Inc",
        issue: "Unable to export data in CSV format",
        priority: "medium",
        status: "open",
        assignee: "Mike Rodriguez",
        created: "4h ago",
      },
      {
        id: "TKT-2831",
        customer: "Global Systems",
        issue: "Dashboard loading slowly for large datasets",
        priority: "medium",
        status: "done",
        assignee: "Alex Kim",
        created: "6h ago",
      },
      {
        id: "TKT-2828",
        customer: "BuildCo",
        issue: "Webhook delivery failures for payment events",
        priority: "high",
        status: "open",
        assignee: "Jordan Lee",
        created: "8h ago",
      },
      {
        id: "TKT-2821",
        customer: "DataFlow Inc",
        issue: "Rate limit errors during bulk operations",
        priority: "high",
        status: "in-progress",
        assignee: "Sarah Chen",
        created: "10h ago",
      },
      {
        id: "TKT-2815",
        customer: "CloudNine",
        issue: "User permissions not syncing across teams",
        priority: "low",
        status: "done",
        assignee: "Taylor Singh",
        created: "12h ago",
      },
      {
        id: "TKT-2809",
        customer: "Nexus Labs",
        issue: "Mobile app crashes on iOS 17 devices",
        priority: "high",
        status: "in-progress",
        assignee: "Mike Rodriguez",
        created: "14h ago",
      },
      {
        id: "TKT-2801",
        customer: "Velocity Systems",
        issue: "Email notifications delayed by 2+ hours",
        priority: "medium",
        status: "waiting",
        assignee: "Alex Kim",
        created: "16h ago",
      },
    ];

    return tickets.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
  }, []);

  // MediaCard setup - RSC Guide
  const mediaCard: SerializableMediaCard = useMemo(
    () => ({
      id: "rsc-guide",
      kind: "link",
      href: "https://react.dev/reference/rsc/server-components",
      src: "https://react.dev/reference/rsc/server-components",
      title: "React Server Components",
      description:
        "Server Components are a new type of Component that renders ahead of time, before bundling. Learn how to use them in your app.",
      ratio: "16:9",
      domain: "react.dev",
      thumb:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200",
      createdAtISO: "2025-01-15T10:30:00.000Z",
      source: {
        label: "React Docs",
        iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=react",
        url: "https://react.dev",
      },
      og: {
        imageUrl:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200",
        description: "Official React documentation for Server Components.",
        title: "React Server Components",
      },
    }),
    [],
  );

  // SocialPost setup - Open Source Release
  const socialPost: SerializableSocialPost = useMemo(
    () => ({
      id: "x-draft-oss",
      platform: "x",
      author: {
        name: "DevTools Team",
        handle: "devtoolsco",
        avatarUrl:
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=1200",
      },
      text: "We're thrilled to announce that our component library is now open source! 🎉\n\nBuilt with React, TypeScript, and Tailwind. Fully accessible, customizable, and production-ready.\n\nStar us on GitHub and join the community ⭐️\n\ngithub.com/devtools/ui-kit",
      createdAtISO: "2025-11-10T14:30:00.000Z",
      language: "en-US",
    }),
    [],
  );

  // DecisionPrompt setup
  const decisionActions: DecisionPromptAction[] = useMemo(
    () => [
      { id: "cancel", label: "Discard", variant: "ghost" },
      { id: "edit", label: "Revise", variant: "outline" },
      { id: "send", label: "Post Now", variant: "default" },
    ],
    [],
  );

  // Scene configurations
  const sceneConfigs: SceneConfig[] = useMemo(
    () => [
      // Scene 1: Support Tickets / DataTable
      {
        userMessage: "Show me high-priority support tickets from this week",
        thinkingSteps: [
          "Querying ticket database…",
          "Filtering by priority…",
          "Sorting by urgency…",
        ],
        preamble: "Here are the most urgent tickets from this week",
        toolUI: (
          <DataTable<SupportTicket>
            rowIdKey="id"
            columns={tableColumns}
            data={tableData}
            layout="table"
            defaultSort={{ by: "priority", direction: "asc" }}
          />
        ),
        toolFallbackHeight: 320,
      },
      // Scene 2: RSC Guide / MediaCard
      {
        userMessage: "Find that React Server Components guide",
        thinkingSteps: [
          "Searching documentation…",
          "Fetching page metadata…",
          "Generating preview…",
        ],
        preamble: "Here's what I believe you're looking for:",
        toolUI: <MediaCard {...mediaCard} maxWidth="420px" />,
        toolFallbackHeight: 260,
      },
      // Scene 3: Open Source Release / SocialPost + DecisionPrompt
      {
        userMessage: "Draft a tweet about our open-source release",
        thinkingSteps: [
          "Analyzing project details…",
          "Crafting announcement…",
          "Adding hashtags…",
        ],
        preamble: "Here's a draft announcement:",
        toolUI: (
          <div className="w-full max-w-[600px] min-w-0 space-y-3">
            <SocialPost {...socialPost} className="w-full" maxWidth="100%" />
            <DecisionPrompt
              prompt="Ready to announce?"
              actions={decisionActions}
              align="right"
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
