"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/ui/cn";
import { DataTable, type Column } from "@/components/tool-ui/data-table";
import {
  MediaCard,
  type SerializableMediaCard,
} from "@/components/tool-ui/media-card";
import { Chart, type SerializableChart } from "@/components/tool-ui/chart";

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
import { XPost, type XPostData } from "@/components/tool-ui/x-post";

type BubbleProps = {
  role: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
};

function ChatBubble({ role, children, className }: BubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end pb-3" : "justify-start",
      )}
      aria-label={isUser ? "User message" : "Assistant message"}
    >
      <div
        className={cn(
          "relative max-w-[min(720px,100%)]",
          "text-xl",
          isUser && "rounded-full bg-[#007AFF] text-white dark:bg-[#002b90]",
          !isUser && "text-foreground",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

const MOTION = {
  durations: {
    userIn: 500,
    preambleIn: 280,
    toolIn: 600,
  },
  beats: {
    afterUser: 700,
    beforeContent: 500,
    afterPreamble: 200,
  },
  sceneHold: 4500,
  exitStagger: {
    user: 0,
    preamble: 120,
    tool: 180,
  },
  reducedMotion: {
    duration: 250,
    sceneHold: 1500,
  },
  // Spring configurations
  springs: {
    gentle: { type: "spring" as const, damping: 28, stiffness: 180, mass: 0.8 },
    smooth: { type: "spring" as const, damping: 24, stiffness: 260, mass: 0.8 },
  },
};

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

// Static demo data - defined at module level to avoid recreation
const TABLE_COLUMNS: Column<SupportTicket>[] = [
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
];

const TABLE_DATA: SupportTicket[] = (
  [
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
      id: "TKT-2815",
      customer: "CloudNine",
      issue: "User permissions not syncing across teams",
      priority: "low",
      status: "done",
      assignee: "Taylor Singh",
      created: "12h ago",
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
  ] as SupportTicket[]
).sort((a, b) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return priorityOrder[a.priority] - priorityOrder[b.priority];
});

const MEDIA_CARD: SerializableMediaCard = {
  id: "chat-showcase-media-card",
  assetId: "rsc-guide",
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
};

const X_POST: XPostData = {
  id: "chat-showcase-x-post",
  author: {
    name: "DevTools Team",
    handle: "devtoolsco",
    avatarUrl:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=1200",
  },
  text: "We're thrilled to announce that our component library is now open source! 🎉\n\nBuilt with React, TypeScript, and Tailwind. Fully accessible, customizable, and production-ready.\n\nStar us on GitHub and join the community ⭐️\n\ngithub.com/devtools/ui-kit",
  createdAt: "2025-11-10T14:30:00.000Z",
};

const X_POST_ACTIONS = [
  { id: "cancel", label: "Discard", variant: "ghost" as const },
  { id: "edit", label: "Revise", variant: "outline" as const },
  { id: "send", label: "Post Now", variant: "default" as const },
];

const CHART_DATA = [
  { month: "Oct", signups: 1240, activations: 890 },
  { month: "Nov", signups: 1580, activations: 1190 },
  { month: "Dec", signups: 2120, activations: 1720 },
];

const SIGNUP_CHART: Omit<SerializableChart, "id"> = {
  type: "line",
  title: "Q4 Signups",
  data: CHART_DATA,
  xKey: "month",
  series: [
    { key: "signups", label: "Signups" },
    { key: "activations", label: "Activations" },
  ],
  showLegend: true,
};

function createSceneConfigs(): SceneConfig[] {
  return [
    {
      userMessage: "How did signups perform this quarter?",
      preamble: "Here's the Q4 signup trend:",
      toolUI: (
        <Chart
          id="chat-showcase-chart"
          {...SIGNUP_CHART}
          className="w-full max-w-[560px]"
        />
      ),
      toolFallbackHeight: 240,
    },
    {
      userMessage: "Show me high-priority support tickets from this week",
      preamble: "Here are the most urgent tickets from this week",
      toolUI: (
        <DataTable<SupportTicket>
          id="chat-showcase-data-table"
          rowIdKey="id"
          columns={TABLE_COLUMNS}
          data={TABLE_DATA}
          layout="table"
          defaultSort={{ by: "priority", direction: "asc" }}
        />
      ),
      toolFallbackHeight: 320,
    },
    {
      userMessage: "Find that React Server Components guide",
      preamble: "Was it this one from yesterday?",
      toolUI: <MediaCard {...MEDIA_CARD} maxWidth="420px" />,
      toolFallbackHeight: 260,
    },
    // Scene 4: Open Source Release / XPost with responseActions
    {
      userMessage: "Draft a tweet about our open-source release",
      preamble: "Here's a draft announcement:",
      toolUI: (
        <div className="w-full max-w-[600px] min-w-0">
          <XPost
            post={X_POST}
            className="w-full"
            responseActions={X_POST_ACTIONS}
          />
        </div>
      ),
      toolFallbackHeight: 480,
    },
  ];
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

function useSceneTimeline({
  reducedMotion,
  onComplete,
  hasUserMessage = true,
}: {
  reducedMotion: boolean;
  onComplete: () => void;
  hasUserMessage?: boolean;
}) {
  const [preambleReady, setPreambleReady] = useState(reducedMotion);
  const [showTool, setShowTool] = useState(reducedMotion);
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      const id = window.setTimeout(onComplete, MOTION.reducedMotion.sceneHold);
      return () => window.clearTimeout(id);
    }
  }, [reducedMotion, onComplete]);

  useEffect(() => {
    if (reducedMotion || preambleReady) return;
    const delay = hasUserMessage
      ? MOTION.durations.userIn + MOTION.beats.afterUser
      : 0;
    const id = window.setTimeout(() => setPreambleReady(true), delay);
    return () => window.clearTimeout(id);
  }, [preambleReady, reducedMotion, hasUserMessage]);

  useEffect(() => {
    if (!scheduledRef.current && preambleReady && showTool && !reducedMotion) {
      scheduledRef.current = true;
      const id = window.setTimeout(onComplete, MOTION.sceneHold);
      return () => window.clearTimeout(id);
    }
  }, [preambleReady, showTool, onComplete, reducedMotion]);

  return useMemo(
    () => ({
      preambleReady,
      showTool,
      setShowTool,
    }),
    [preambleReady, showTool],
  );
}

type SceneConfig = {
  userMessage?: string;
  preamble?: string;
  toolUI: React.ReactNode;
  toolFallbackHeight?: number;
};

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

  const handlePreambleComplete = useCallback(() => {
    timeline.setShowTool(true);
  }, [timeline]);

  useEffect(() => {
    if (!config.preamble && timeline.preambleReady && !timeline.showTool) {
      timeline.setShowTool(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.preamble,
    timeline.preambleReady,
    timeline.showTool,
    timeline.setShowTool,
  ]);

  const showItems = !isExiting;

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 pr-3">
      <div className="flex flex-col">
        <AnimatePresence>
          {showItems && config.userMessage && (
            <motion.div
              key={`${sceneId}-user`}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  damping: 26,
                  stiffness: 220,
                  mass: 0.7,
                  delay: 0.08,
                },
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.97,
                transition: {
                  type: "spring",
                  damping: 26,
                  stiffness: 220,
                  mass: 0.7,
                  delay: MOTION.exitStagger.user / 1000,
                },
              }}
              className="mb-11"
            >
              <ChatBubble role="user" className="px-6 py-3">
                {config.userMessage}
              </ChatBubble>
            </motion.div>
          )}

          {showItems && timeline.preambleReady && config.preamble && (
            <motion.div
              key={`${sceneId}-preamble`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  type: "spring",
                  damping: 26,
                  stiffness: 220,
                  mass: 0.7,
                  delay: MOTION.beats.beforeContent / 1000,
                },
              }}
              exit={{
                opacity: 0,
                transition: {
                  type: "spring",
                  damping: 26,
                  stiffness: 220,
                  mass: 0.7,
                  delay: MOTION.exitStagger.preamble / 1000,
                },
              }}
              className="mb-3"
            >
              <PreambleBubble
                text={config.preamble}
                reducedMotion={reducedMotion}
                onComplete={handlePreambleComplete}
              />
            </motion.div>
          )}

          {showItems &&
            timeline.preambleReady &&
            (config.preamble ? timeline.showTool : true) && (
              <motion.div
                key={`${sceneId}-tool`}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    damping: 26,
                    stiffness: 220,
                    mass: 0.7,
                    delay: config.preamble
                      ? MOTION.beats.afterPreamble / 1000
                      : MOTION.beats.beforeContent / 1000,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  scale: 0.97,
                  transition: {
                    type: "spring",
                    damping: 26,
                    stiffness: 220,
                    mass: 0.7,
                    delay: MOTION.exitStagger.tool / 1000,
                  },
                }}
                className={config.userMessage ? "" : "mb-11"}
              >
                <div className="flex w-full justify-start">
                  <div className="w-full max-w-[720px] *:**:data-[slot=table]:min-w-0">
                    <ToolReveal>{config.toolUI}</ToolReveal>
                  </div>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ChatShowcase() {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const sceneConfigs = useMemo(() => createSceneConfigs(), []);

  // Scene switching with exit control
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneRunId, setSceneRunId] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const nextScene = useCallback(() => {
    setIsExiting(true);
    const exitDuration = reducedMotion
      ? MOTION.reducedMotion.duration
      : MOTION.exitStagger.tool + 500;
    setTimeout(() => {
      setIsExiting(false);
      setSceneIndex((i) => (i + 1) % 4);
      setSceneRunId((id) => id + 1);
    }, exitDuration);
  }, [reducedMotion]);

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
