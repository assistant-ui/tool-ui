"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { cn } from "@/lib/ui/cn";
import { DataTable } from "@/components/tool-ui/data-table";
import { MediaCard } from "@/components/tool-ui/media-card";
import { Chart } from "@/components/tool-ui/chart";
import { XPost } from "@/components/tool-ui/x-post";
import { Plan } from "@/components/tool-ui/plan";
import { Terminal } from "@/components/tool-ui/terminal";
import { CodeBlock } from "@/components/tool-ui/code-block";
import { OptionList } from "@/components/tool-ui/option-list";
import {
  type SupportTicket,
  TABLE_COLUMNS,
  TABLE_DATA,
  MEDIA_CARD,
  X_POST,
  X_POST_ACTIONS,
  SIGNUP_CHART,
  PLAN_TODO_LABELS,
  CODE_BLOCK_DATA,
  OPTION_LIST_OPTIONS,
} from "@/lib/mocks/chat-showcase-data";

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
    preamble: 80,
    tool: 160,
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

function ToolReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={SPRINGS.gentle}
    >
      {children}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.span
      className="bg-foreground/50 block size-4 rounded-full"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-label="Assistant is typing"
    />
  );
}

const TEST_LINES = [
  "✓ login flow handles invalid credentials",
  "✓ session tokens refresh correctly",
  "✓ logout clears all cookies",
  "",
  "Tests: 3 passed, 3 total",
];

function AnimatedTerminal({ className }: { className?: string }) {
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    if (lineCount >= TEST_LINES.length) return;

    const delay = lineCount === 0 ? 300 : 700;
    const timeoutId = window.setTimeout(() => {
      setLineCount((c) => c + 1);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [lineCount]);

  const visibleOutput = TEST_LINES.slice(0, lineCount).join("\n") || " ";
  const isComplete = lineCount >= TEST_LINES.length;

  return (
    <Terminal
      id="chat-showcase-terminal"
      command="pnpm test auth"
      stdout={visibleOutput}
      exitCode={0}
      durationMs={isComplete ? 1243 : undefined}
      className={className}
    />
  );
}

function AnimatedPlan({ className }: { className?: string }) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (completedCount >= PLAN_TODO_LABELS.length) return;

    const delay = completedCount === 0 ? 600 : 800;
    const timeoutId = window.setTimeout(() => {
      setCompletedCount((c) => c + 1);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [completedCount]);

  const todos = PLAN_TODO_LABELS.map((label: string, index: number) => ({
    id: String(index + 1),
    label,
    status:
      index < completedCount
        ? ("completed" as const)
        : index === completedCount
          ? ("in_progress" as const)
          : ("pending" as const),
  }));

  return (
    <Plan
      id="chat-showcase-plan"
      title="Production Deployment"
      description="Deploy the main branch to the production cluster"
      todos={todos}
      showProgress
      className={className}
    />
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
  msPerChar?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
};

function StreamingChar({ char, delay }: { char: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {char}
    </motion.span>
  );
}

function PreambleBubble({
  text,
  msPerChar = 28,
  reducedMotion,
  onComplete,
}: PreambleBubbleProps) {
  const [isVisible, setIsVisible] = useState(reducedMotion);
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    if (reducedMotion) return;

    const timeoutId = window.setTimeout(() => setIsVisible(true), 100);
    return () => window.clearTimeout(timeoutId);
  }, [reducedMotion]);

  useEffect(() => {
    if (hasCalledComplete.current) return;

    if (reducedMotion) {
      hasCalledComplete.current = true;
      onComplete?.();
      return;
    }

    if (!isVisible) return;

    const totalDuration = text.length * msPerChar + 400;
    const timeoutId = window.setTimeout(() => {
      if (!hasCalledComplete.current) {
        hasCalledComplete.current = true;
        onComplete?.();
      }
    }, totalDuration);

    return () => window.clearTimeout(timeoutId);
  }, [reducedMotion, msPerChar, text.length, onComplete, isVisible]);

  const characters = useMemo(() => {
    return text.split("").map((char, index) => ({
      char,
      delay: index * (msPerChar / 1000),
    }));
  }, [text, msPerChar]);

  if (reducedMotion) {
    return (
      <ChatBubble role="assistant">
        <span>{text}</span>
      </ChatBubble>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={SPRINGS.smooth}
    >
      <ChatBubble role="assistant">
        <span>
          {isVisible &&
            characters.map(({ char, delay }, index) => (
              <StreamingChar key={index} char={char} delay={delay} />
            ))}
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
      userMessage: "Help me deploy this to production",
      preamble: "Here's the plan. I'll get started now.",
      toolUI: <AnimatedPlan className="w-full max-w-[480px]" />,
      toolFallbackHeight: 280,
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
      userMessage: "Run the tests for the auth module",
      preamble: "Running tests...",
      toolUI: <AnimatedTerminal className="w-full max-w-[560px]" />,
      toolFallbackHeight: 200,
    },
    {
      userMessage: "Set up integrations for this project",
      preamble: "Which integrations should we enable?",
      toolUI: (
        <OptionList
          id="chat-showcase-option-list"
          options={OPTION_LIST_OPTIONS}
          selectionMode="multi"
          defaultValue={["slack", "github"]}
          className="w-full max-w-[480px]"
        />
      ),
      toolFallbackHeight: 320,
    },
    {
      userMessage: "Need a debounce hook",
      preamble: "Here's a solid useDebounce hook",
      toolUI: (
        <CodeBlock
          id="chat-showcase-code-block"
          {...CODE_BLOCK_DATA}
          className="w-full"
        />
      ),
      toolFallbackHeight: 260,
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

const SCENE_COUNT = 8;

type AnimatedSceneProps = {
  config: SceneConfig;
  reducedMotion: boolean;
  onComplete: () => void;
  sceneId: string;
  isExiting?: boolean;
  composerPadding?: boolean;
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
    <div className="flex flex-col">
      <AnimatePresence>
        {shouldRenderItems && config.userMessage && (
          <motion.div
            key={`${sceneId}-user`}
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: createEntryTransition(80),
            }}
            exit={{
              opacity: 0,
              y: -8,
              transition: createExitTransition(TIMING.exitStagger.user),
            }}
            className="mb-11"
          >
            <ChatBubble role="user" className="px-6 py-3">
              {config.userMessage}
            </ChatBubble>
          </motion.div>
        )}

        {shouldRenderItems && config.preamble && (
          <motion.div
            key={`${sceneId}-preamble-area`}
            className="relative mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              y: -8,
              transition: createExitTransition(TIMING.exitStagger.preamble),
            }}
          >
            <AnimatePresence>
              {config.userMessage &&
                !timeline.preambleReady &&
                !reducedMotion && (
                  <motion.div
                    key={`${sceneId}-indicator`}
                    className="absolute top-1.5 left-0"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: {
                        ...SPRINGS.smooth,
                        delay: TIMING.durations.userIn / 1000,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15, ease: "easeOut" },
                    }}
                  >
                    <TypingIndicator />
                  </motion.div>
                )}
            </AnimatePresence>

            {timeline.preambleReady && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <PreambleBubble
                  text={config.preamble}
                  reducedMotion={reducedMotion}
                  onComplete={handlePreambleComplete}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {shouldRenderItems &&
          timeline.preambleReady &&
          shouldShowToolContent && (
            <motion.div
              key={`${sceneId}-tool`}
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: createEntryTransition(
                  config.preamble
                    ? TIMING.beats.afterPreamble
                    : TIMING.beats.beforeContent,
                ),
              }}
              exit={{
                opacity: 0,
                y: -8,
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
  );
}

export function ChatShowcase() {
  const reducedMotion = useReducedMotion();
  const sceneConfigs = useMemo(() => createSceneConfigs(), []);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneRunId, setSceneRunId] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const exitDuration = reducedMotion
    ? TIMING.reducedMotion.duration
    : TIMING.exitStagger.tool + 500;

  const transitionToScene = useCallback(
    (getNextIndex: (current: number) => number) => {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        setSceneIndex(getNextIndex);
        setSceneRunId((id) => id + 1);
      }, exitDuration);
    },
    [exitDuration],
  );

  const advanceToNextScene = useCallback(() => {
    transitionToScene((current) => (current + 1) % SCENE_COUNT);
  }, [transitionToScene]);

  const goToPreviousScene = useCallback(() => {
    transitionToScene((current) => (current - 1 + SCENE_COUNT) % SCENE_COUNT);
  }, [transitionToScene]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        advanceToNextScene();
      } else if (e.key === "ArrowLeft") {
        goToPreviousScene();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advanceToNextScene, goToPreviousScene]);

  return (
    <div className="relative flex h-full w-full flex-col">
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
