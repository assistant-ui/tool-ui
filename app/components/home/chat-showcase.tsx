"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { cn } from "@/lib/ui/cn";
import { CitationList } from "@/components/tool-ui/citation";
import { DataTable } from "@/components/tool-ui/data-table";
import { LinkPreview } from "@/components/tool-ui/link-preview";
import { Plan } from "@/components/tool-ui/plan";
import { Terminal } from "@/components/tool-ui/terminal";
import { CodeBlock } from "@/components/tool-ui/code-block";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import { ParameterSlider } from "@/components/tool-ui/parameter-slider";
import { StatsDisplay } from "@/components/tool-ui/stats-display";
import { ProgressTracker } from "@/components/tool-ui/progress-tracker";
import { MessageDraft } from "@/components/tool-ui/message-draft";
import { WeatherWidget } from "@/components/tool-ui/weather-widget";
import {
  type Flight,
  TABLE_COLUMNS,
  TABLE_DATA,
  LINK_PREVIEW,
  PLAN_TODO_LABELS,
  ITEM_CAROUSEL_DATA,
  LLM_CITATIONS,
  PARAMETER_SLIDER_DATA,
  STATS_DISPLAY_DATA,
  PROGRESS_TRACKER_DATA,
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
  initialDelay = 0,
}: {
  reducedMotion: boolean;
  onComplete: () => void;
  hasUserMessage?: boolean;
  initialDelay?: number;
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

    const delay =
      initialDelay +
      (hasUserMessage ? TIMING.durations.userIn + TIMING.beats.afterUser : 0);

    const timeoutId = window.setTimeout(() => setPreambleReady(true), delay);
    return () => window.clearTimeout(timeoutId);
  }, [preambleReady, reducedMotion, hasUserMessage, initialDelay]);

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
  "\x1b[32m✓\x1b[0m login flow handles invalid credentials \x1b[90m(3 tests)\x1b[0m \x1b[33m42ms\x1b[0m",
  "\x1b[32m✓\x1b[0m session tokens refresh correctly \x1b[90m(5 tests)\x1b[0m \x1b[33m128ms\x1b[0m",
  "\x1b[32m✓\x1b[0m logout clears all cookies \x1b[90m(2 tests)\x1b[0m \x1b[33m18ms\x1b[0m",
  "",
  "\x1b[32mTests:\x1b[0m 10 passed, 10 total",
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

    const delay = completedCount === 0 ? 400 : 1100;
    const timeoutId = window.setTimeout(() => {
      setCompletedCount((c) => c + 1);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [completedCount]);

  const todoDescriptions = [
    "Analyzing social media activity and recent conversations",
    "Browsing gift guides and personalized recommendations",
    "Evaluating quality, reviews, and price ranges",
    "Selecting the top 3 options with purchase links",
  ];

  const todos = PLAN_TODO_LABELS.map((label: string, index: number) => ({
    id: String(index + 1),
    label,
    description: todoDescriptions[index],
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
      title="Gift Research"
      description="Finding the perfect birthday gift for Sarah"
      todos={todos}
      showProgress
      className={className}
    />
  );
}

function AnimatedProgressTracker({ className }: { className?: string }) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (currentStep >= 3) return;

    const delay = currentStep === 1 ? 1300 : 1500;
    const timeoutId = window.setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [currentStep]);

  const steps = PROGRESS_TRACKER_DATA.steps.map((step, index) => ({
    ...step,
    status:
      index < currentStep
        ? ("completed" as const)
        : index === currentStep
          ? ("in-progress" as const)
          : ("pending" as const),
  }));

  const elapsedTime = PROGRESS_TRACKER_DATA.elapsedTime! + (currentStep * 12000);

  return (
    <ProgressTracker
      id="chat-showcase-progress-tracker"
      steps={steps}
      elapsedTime={elapsedTime}
      responseActions={PROGRESS_TRACKER_DATA.responseActions}
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
  msPerChar = 18,
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
  const { title: _title, ...statsDataWithoutTitle } = STATS_DISPLAY_DATA;

  return [
    {
      userMessage: "How's the business doing this quarter?",
      preamble: "Q4 numbers are in. Looking solid.",
      toolUI: (
        <StatsDisplay
          id="chat-showcase-stats-display"
          {...statsDataWithoutTitle}
          className="w-full max-w-[560px]"
        />
      ),
      toolFallbackHeight: 280,
    },
    {
      userMessage: "What's the weather like this week?",
      preamble: "Looking mild with some rain midweek.",
      toolUI: (
        <WeatherWidget
          id="chat-showcase-weather"
          location="San Francisco, CA"
          current={{
            temp: 62,
            tempMin: 54,
            tempMax: 66,
            condition: "partly-cloudy",
          }}
          forecast={[
            { day: "Tue", tempMin: 52, tempMax: 64, condition: "cloudy" },
            { day: "Wed", tempMin: 50, tempMax: 58, condition: "rain" },
            { day: "Thu", tempMin: 51, tempMax: 61, condition: "drizzle" },
            { day: "Fri", tempMin: 53, tempMax: 65, condition: "partly-cloudy" },
            { day: "Sat", tempMin: 55, tempMax: 68, condition: "clear" },
          ]}
          unit="fahrenheit"
          className="w-full max-w-[400px]"
        />
      ),
      toolFallbackHeight: 280,
    },
    {
      userMessage: "Boost the bass a bit on this track",
      preamble: "Bass is up. Here's the full EQ.",
      toolUI: (
        <ParameterSlider
          id="chat-showcase-parameter-slider"
          sliders={[
            {
              id: "bass",
              label: "Bass",
              min: -12,
              max: 12,
              step: 1,
              value: 4,
              unit: "dB",
              fillClassName: "bg-rose-500/25 dark:bg-rose-400/30",
              handleClassName: "bg-rose-500 dark:bg-rose-400"
            },
            {
              id: "mid",
              label: "Mid",
              min: -12,
              max: 12,
              step: 1,
              value: -1,
              unit: "dB",
              fillClassName: "bg-amber-500/25 dark:bg-amber-400/30",
              handleClassName: "bg-amber-500 dark:bg-amber-400"
            },
            {
              id: "treble",
              label: "Treble",
              min: -12,
              max: 12,
              step: 1,
              value: 3,
              unit: "dB",
              fillClassName: "bg-sky-500/25 dark:bg-sky-400/30",
              handleClassName: "bg-sky-500 dark:bg-sky-400"
            },
          ]}
          responseActions={PARAMETER_SLIDER_DATA.responseActions}
          className="w-full max-w-[480px]"
        />
      ),
      toolFallbackHeight: 240,
    },
    {
      userMessage: "Find me a birthday gift for Sarah",
      preamble: "On it. Checking her interests now.",
      toolUI: <AnimatedPlan className="w-full max-w-[480px]" />,
      toolFallbackHeight: 280,
    },
    {
      userMessage: "What should I listen to right now?",
      preamble: "Found a few albums for you.",
      toolUI: (
        <ItemCarousel
          id="chat-showcase-item-carousel"
          {...ITEM_CAROUSEL_DATA}
          className="w-full max-w-[640px]"
        />
      ),
      toolFallbackHeight: 320,
    },
    {
      userMessage: "Run the tests for the auth module",
      preamble: "Running auth tests now.",
      toolUI: <AnimatedTerminal className="w-full max-w-[560px]" />,
      toolFallbackHeight: 200,
    },
    {
      userMessage: "Deploy the updates to production",
      preamble: "Deployment started. Tracking progress.",
      toolUI: <AnimatedProgressTracker className="w-full max-w-[480px]" />,
      toolFallbackHeight: 260,
    },
    {
      userMessage: "Find me flights to Tokyo in March",
      preamble: "Found 4 nonstop flights. Sorted by price.",
      toolUI: (
        <DataTable<Flight>
          id="chat-showcase-data-table"
          rowIdKey="id"
          columns={TABLE_COLUMNS}
          data={TABLE_DATA}
          layout="table"
          defaultSort={{ by: "price", direction: "asc" }}
        />
      ),
      toolFallbackHeight: 320,
    },
    {
      userMessage: "Need a localStorage hook",
      preamble: "Got you. Handles JSON parsing and updates.",
      toolUI: (
        <CodeBlock
          id="chat-showcase-code-block"
          language="typescript"
          filename="use-local-storage.ts"
          code={`import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`}
          showLineNumbers={true}
          className="w-full"
        />
      ),
      toolFallbackHeight: 260,
    },
    {
      userMessage: "Find that physics article from Quanta",
      preamble: "Was it this one?",
      toolUI: <LinkPreview {...LINK_PREVIEW} />,
      toolFallbackHeight: 260,
    },
    {
      userMessage: "Send Marcus the updated proposal",
      preamble: "Drafted this for you. Review before sending.",
      toolUI: (
        <MessageDraft
          id="chat-showcase-message-draft"
          channel="email"
          subject="Updated proposal attached"
          to={["marcus.chen@acme.co"]}
          body={`Hi Marcus,

I've attached the revised proposal with the changes we discussed. The new timeline reflects the Q2 launch date, and I've adjusted the budget breakdown in section 3.

Let me know if you have any questions.

Best,
Sarah`}
          className="w-full max-w-[480px]"
        />
      ),
      toolFallbackHeight: 340,
    },
    {
      userMessage: "What was the first LLM?",
      preamble: "GPT-1 from OpenAI in 2018. Here are the key sources.",
      toolUI: (
        <CitationList
          id="showcase-citations"
          citations={LLM_CITATIONS}
          variant="stacked"
          className="w-full max-w-[480px]"
        />
      ),
      toolFallbackHeight: 56,
    },
  ];
}

const SCENE_COUNT = 11;

type AnimatedSceneProps = {
  config: SceneConfig;
  reducedMotion: boolean;
  onComplete: () => void;
  sceneId: string;
  isExiting?: boolean;
  composerPadding?: boolean;
  initialDelay?: number;
};

function AnimatedScene({
  config,
  reducedMotion,
  onComplete,
  sceneId,
  isExiting = false,
  initialDelay = 0,
}: AnimatedSceneProps) {
  const timeline = useSceneTimeline({
    reducedMotion,
    onComplete,
    hasUserMessage: !!config.userMessage,
    initialDelay,
  });

  const handlePreambleComplete = useCallback(() => {
    timeline.setShowTool(true);
  }, [timeline]);

  useEffect(() => {
    const shouldShowTool = timeline.preambleReady && !timeline.showTool;

    if (shouldShowTool) {
      timeline.setShowTool(true);
    }
  }, [timeline]);

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
    <div className="flex flex-col pb-20">
      <AnimatePresence>
        {shouldRenderItems && config.userMessage && (
          <motion.div
            key={`${sceneId}-user`}
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: createEntryTransition(initialDelay + 80),
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
                    initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      filter: "blur(0px)",
                      transition: {
                        ...SPRINGS.smooth,
                        delay: TIMING.durations.userIn / 1000,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      x: 20,
                      filter: "blur(4px)",
                      transition: { duration: 0.2, ease: "easeOut" },
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
                  (config.preamble
                    ? TIMING.beats.afterPreamble
                    : TIMING.beats.beforeContent) + 300,
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
            initialDelay={sceneRunId === 0 ? 2500 : 0}
          />
        </motion.div>
      </div>
    </div>
  );
}
