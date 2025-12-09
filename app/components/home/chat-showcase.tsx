"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { cn } from "@/lib/ui/cn";
import { DataTable } from "@/components/tool-ui/data-table";
import { MediaCard } from "@/components/tool-ui/media-card";
import { Chart } from "@/components/tool-ui/chart";
import { XPost } from "@/components/tool-ui/x-post";
import {
  type SupportTicket,
  TABLE_COLUMNS,
  TABLE_DATA,
  MEDIA_CARD,
  X_POST,
  X_POST_ACTIONS,
  SIGNUP_CHART,
} from "./chat-showcase-data";

const TIMING = {
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
} as const;

const SPRINGS = {
  gentle: {
    type: "spring",
    damping: 28,
    stiffness: 180,
    mass: 0.8,
  },
  smooth: {
    type: "spring",
    damping: 24,
    stiffness: 260,
    mass: 0.8,
  },
  standard: {
    type: "spring",
    damping: 26,
    stiffness: 220,
    mass: 0.7,
  },
} as const satisfies Record<string, Transition>;

type SceneConfig = {
  userMessage?: string;
  preamble?: string;
  toolUI: React.ReactNode;
  toolFallbackHeight?: number;
};

type SceneTimelineState = {
  preambleReady: boolean;
  showTool: boolean;
  setShowTool: (value: boolean) => void;
};

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  return reducedMotion;
}

function useSceneTimeline({
  reducedMotion,
  onComplete,
  hasUserMessage = true,
}: {
  reducedMotion: boolean;
  onComplete: () => void;
  hasUserMessage?: boolean;
}): SceneTimelineState {
  const [preambleReady, setPreambleReady] = useState(reducedMotion);
  const [showTool, setShowTool] = useState(reducedMotion);
  const hasScheduledCompletion = useRef(false);

  useEffect(() => {
    if (!reducedMotion) return;

    const timeoutId = window.setTimeout(
      onComplete,
      TIMING.reducedMotion.sceneHold,
    );
    return () => window.clearTimeout(timeoutId);
  }, [reducedMotion, onComplete]);

  useEffect(() => {
    if (reducedMotion || preambleReady) return;

    const delay = hasUserMessage
      ? TIMING.durations.userIn + TIMING.beats.afterUser
      : 0;

    const timeoutId = window.setTimeout(() => setPreambleReady(true), delay);
    return () => window.clearTimeout(timeoutId);
  }, [preambleReady, reducedMotion, hasUserMessage]);

  useEffect(() => {
    const shouldScheduleCompletion =
      !hasScheduledCompletion.current &&
      preambleReady &&
      showTool &&
      !reducedMotion;

    if (!shouldScheduleCompletion) return;

    hasScheduledCompletion.current = true;
    const timeoutId = window.setTimeout(onComplete, TIMING.sceneHold);
    return () => window.clearTimeout(timeoutId);
  }, [preambleReady, showTool, onComplete, reducedMotion]);

  return useMemo(
    () => ({ preambleReady, showTool, setShowTool }),
    [preambleReady, showTool],
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
      initial={{ opacity: 0, y: 30, scale: 0.94, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={SPRINGS.gentle}
    >
      {children}
    </motion.div>
  );
}

type ChatBubbleProps = {
  role: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
};

function ChatBubble({ role, children, className }: ChatBubbleProps) {
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
          "relative max-w-[min(720px,100%)] text-xl",
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

type PreambleBubbleProps = {
  text: string;
  speedMsPerChar?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
};

function PreambleBubble({
  text,
  speedMsPerChar = 38,
  reducedMotion,
  onComplete,
}: PreambleBubbleProps) {
  const [charCount, setCharCount] = useState(reducedMotion ? text.length : 0);
  const [isVisible, setIsVisible] = useState(reducedMotion);
  const isTypingComplete = charCount >= text.length;

  useEffect(() => {
    if (reducedMotion) return;

    const timeoutId = window.setTimeout(() => setIsVisible(true), 100);
    return () => window.clearTimeout(timeoutId);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      onComplete?.();
      return;
    }
    if (!isVisible) return;

    let currentIndex = 0;
    const timers: number[] = [];

    const tick = () => {
      currentIndex += 1;
      setCharCount((count) => Math.min(count + 1, text.length));

      if (currentIndex < text.length) {
        timers.push(window.setTimeout(tick, speedMsPerChar));
      } else {
        onComplete?.();
      }
    };

    timers.push(window.setTimeout(tick, speedMsPerChar));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reducedMotion, speedMsPerChar, text.length, onComplete, isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={SPRINGS.smooth}
    >
      <ChatBubble role="assistant">
        <span>
          {text.slice(0, charCount)}
          {!reducedMotion && <TypingCaret visible={!isTypingComplete} />}
        </span>
      </ChatBubble>
    </motion.div>
  );
}

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

const SCENE_COUNT = 4;

type AnimatedSceneProps = {
  config: SceneConfig;
  reducedMotion: boolean;
  onComplete: () => void;
  sceneId: string;
  isExiting?: boolean;
};

function AnimatedScene({
  config,
  reducedMotion,
  onComplete,
  sceneId,
  isExiting = false,
}: AnimatedSceneProps) {
  const timeline = useSceneTimeline({
    reducedMotion,
    onComplete,
    hasUserMessage: !!config.userMessage,
  });

  const handlePreambleComplete = useCallback(() => {
    timeline.setShowTool(true);
  }, [timeline]);

  useEffect(() => {
    const shouldShowToolWithoutPreamble =
      !config.preamble && timeline.preambleReady && !timeline.showTool;

    if (shouldShowToolWithoutPreamble) {
      timeline.setShowTool(true);
    }
  }, [config.preamble, timeline]);

  const shouldRenderItems = !isExiting;
  const shouldShowToolContent = config.preamble ? timeline.showTool : true;

  const createEntryTransition = (delayMs: number) => ({
    ...SPRINGS.standard,
    delay: delayMs / 1000,
  });

  const createExitTransition = (delayMs: number) => ({
    ...SPRINGS.standard,
    delay: delayMs / 1000,
  });

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 pr-3">
      <div className="flex flex-col">
        <AnimatePresence>
          {shouldRenderItems && config.userMessage && (
            <motion.div
              key={`${sceneId}-user`}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: createEntryTransition(80),
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.97,
                transition: createExitTransition(TIMING.exitStagger.user),
              }}
              className="mb-11"
            >
              <ChatBubble role="user" className="px-6 py-3">
                {config.userMessage}
              </ChatBubble>
            </motion.div>
          )}

          {shouldRenderItems && timeline.preambleReady && config.preamble && (
            <motion.div
              key={`${sceneId}-preamble`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: createEntryTransition(TIMING.beats.beforeContent),
              }}
              exit={{
                opacity: 0,
                transition: createExitTransition(TIMING.exitStagger.preamble),
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

          {shouldRenderItems &&
            timeline.preambleReady &&
            shouldShowToolContent && (
              <motion.div
                key={`${sceneId}-tool`}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: createEntryTransition(
                    config.preamble
                      ? TIMING.beats.afterPreamble
                      : TIMING.beats.beforeContent,
                  ),
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  scale: 0.97,
                  transition: createExitTransition(TIMING.exitStagger.tool),
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
  const reducedMotion = useReducedMotion();
  const sceneConfigs = useMemo(() => createSceneConfigs(), []);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneRunId, setSceneRunId] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const advanceToNextScene = useCallback(() => {
    setIsExiting(true);

    const exitDuration = reducedMotion
      ? TIMING.reducedMotion.duration
      : TIMING.exitStagger.tool + 500;

    setTimeout(() => {
      setIsExiting(false);
      setSceneIndex((current) => (current + 1) % SCENE_COUNT);
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
          transition={SPRINGS.smooth}
        >
          <AnimatedScene
            config={sceneConfigs[sceneIndex]}
            reducedMotion={reducedMotion}
            onComplete={advanceToNextScene}
            sceneId={`scene-${sceneIndex}`}
            isExiting={isExiting}
          />
        </motion.div>
      </div>
    </div>
  );
}
