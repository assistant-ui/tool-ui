"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { cn } from "@/lib/ui/cn";
import {
  previewConfigs,
  type ComponentId,
} from "@/lib/docs/preview-config";
import { getStagingConfig } from "@/lib/staging/staging-config";
import type { DebugLevel } from "@/lib/staging/types";

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

interface ChatBubbleProps {
  role: "user" | "assistant";
  children: ReactNode;
  className?: string;
}

function ChatBubble({ role, children, className }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end pb-3" : "justify-start",
      )}
    >
      <div
        className={cn(
          "relative max-w-[min(720px,100%)] text-base leading-relaxed",
          isUser && "rounded-2xl bg-blue-600 px-4 py-2.5 text-white dark:bg-blue-700",
          !isUser && "text-foreground",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <motion.span
      className="bg-foreground/50 block size-3 rounded-full"
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

interface PreambleBubbleProps {
  text: string;
  msPerChar?: number;
  onComplete?: () => void;
}

function PreambleBubble({
  text,
  msPerChar = 28,
  onComplete,
}: PreambleBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsVisible(true), 100);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (hasCalledComplete.current || !isVisible) return;

    const totalDuration = text.length * msPerChar + 400;
    const timeoutId = window.setTimeout(() => {
      if (!hasCalledComplete.current) {
        hasCalledComplete.current = true;
        onComplete?.();
      }
    }, totalDuration);

    return () => window.clearTimeout(timeoutId);
  }, [msPerChar, text.length, onComplete, isVisible]);

  const characters = useMemo(() => {
    return text.split("").map((char, index) => ({
      char,
      delay: index * (msPerChar / 1000),
    }));
  }, [text, msPerChar]);

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

function ToolReveal({ children }: { children: ReactNode }) {
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

type ShowcasePhase = "user" | "typing" | "preamble" | "tool" | "complete";

interface StagingShowcaseProps {
  componentId: ComponentId;
  presetName: string;
  debugLevel: DebugLevel;
}

export function StagingShowcase({
  componentId,
  presetName,
  debugLevel,
}: StagingShowcaseProps) {
  const [phase, setPhase] = useState<ShowcasePhase>("user");
  const [key, setKey] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);

  const previewConfig = previewConfigs[componentId];
  const stagingConfig = getStagingConfig(componentId);
  const preset = previewConfig?.presets?.[presetName];
  const Wrapper = previewConfig?.wrapper;

  const userMessage = previewConfig?.chatContext?.userMessage ?? "";
  const preamble = previewConfig?.chatContext?.preamble ?? "";

  const startSequence = useCallback(() => {
    setKey((k) => k + 1);
    setPhase("user");

    // User message appears, then show typing
    setTimeout(() => {
      setPhase("typing");
    }, TIMING.durations.userIn);

    // Typing indicator, then show preamble
    setTimeout(() => {
      setPhase("preamble");
    }, TIMING.durations.userIn + TIMING.beats.afterUser);
  }, []);

  const handlePreambleComplete = useCallback(() => {
    setPhase("tool");
    setTimeout(() => {
      setPhase("complete");
    }, TIMING.durations.toolIn);
  }, []);

  // Auto-start sequence on mount and when component/preset changes
  useEffect(() => {
    startSequence();
  }, [componentId, presetName, startSequence]);

  if (!previewConfig || !preset) {
    return (
      <div className="text-muted-foreground text-sm">
        Component or preset not found
      </div>
    );
  }

  const component = previewConfig.renderComponent({
    data: preset.data,
    presetName,
    state: {},
    setState: () => {},
  });

  const wrappedComponent = Wrapper ? <Wrapper>{component}</Wrapper> : component;

  const showTyping = phase === "typing";
  const showPreamble = phase === "preamble" || phase === "tool" || phase === "complete";
  const showTool = phase === "tool" || phase === "complete";

  return (
    <div className="relative h-full w-full max-w-3xl">
      <div className="absolute inset-0 flex flex-col pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`user-${key}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRINGS.standard}
            className="mb-4"
          >
            <ChatBubble role="user">{userMessage}</ChatBubble>
          </motion.div>
        </AnimatePresence>

        <div className="relative min-h-8">
          <AnimatePresence mode="wait">
            {showTyping && (
              <motion.div
                key={`typing-${key}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={SPRINGS.smooth}
                className="absolute top-0 left-0"
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showPreamble && (
              <motion.div
                key={`preamble-${key}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <PreambleBubble
                  text={preamble}
                  onComplete={handlePreambleComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showTool && (
            <motion.div
              key={`tool-${key}`}
              className="mt-4 flex w-full justify-start"
            >
              <div ref={componentRef} className="relative min-w-[500px] [&_article]:max-w-none">
                <ToolReveal>{wrappedComponent}</ToolReveal>

                {debugLevel !== "off" && stagingConfig?.renderDebugOverlay && (
                  <div className="pointer-events-none absolute inset-0">
                    {stagingConfig.renderDebugOverlay({
                      level: debugLevel,
                      componentRef,
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
