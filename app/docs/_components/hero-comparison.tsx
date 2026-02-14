"use client";

import * as React from "react";
import { cn } from "@/lib/ui/cn";
import { MockThread, MockMessage } from "./mock-thread";
import { OptionList } from "@/components/tool-ui/option-list";

type Tab = "without" | "with";

export function HeroComparison() {
  const [activeTab, setActiveTab] = React.useState<Tab>("without");
  const [hasAutoPlayed, setHasAutoPlayed] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = React.useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setActiveTab("with");
      setHasAutoPlayed(true);
      timerRef.current = null;
    }, 3000);
  }, [clearTimer]);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setActiveTab("with");
      setHasAutoPlayed(true);
      return;
    }
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  function handleTabClick(tab: Tab) {
    clearTimer();
    setHasAutoPlayed(true);
    setActiveTab(tab);
  }

  function handleMouseEnter() {
    if (!hasAutoPlayed) clearTimer();
  }

  function handleMouseLeave() {
    if (!hasAutoPlayed) startTimer();
  }

  return (
    <div
      ref={containerRef}
      className="mt-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tabs */}
      <div className="mb-4 inline-flex items-center rounded-lg bg-muted p-1">
        <button
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            activeTab === "without"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => handleTabClick("without")}
        >
          Without Tool UI
        </button>
        <button
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            activeTab === "with"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => handleTabClick("with")}
        >
          With Tool UI
        </button>
      </div>

      {/* Content panels — crossfade with height from active panel */}
      <div className="relative">
        {/* "Without" panel */}
        <div
          className={cn(
            "transition-opacity duration-500 ease-in-out",
            activeTab === "without"
              ? "relative opacity-100"
              : "pointer-events-none absolute inset-0 opacity-0"
          )}
        >
          <MockThread>
            <MockMessage role="user">
              I want to understand how LLMs work. Where should I start?
            </MockMessage>
            <MockMessage role="assistant">
              <p className="text-sm mb-3">
                Here are three paths depending on your learning style:
              </p>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>
                  <strong>Visual intuition first</strong> — 3Blue1Brown&apos;s
                  neural network series plus Karpathy&apos;s Zero to Hero.
                  Watch, then build.
                </li>
                <li>
                  <strong>Code-first</strong> — Karpathy&apos;s nanoGPT
                  walkthrough. Build a transformer from scratch in a notebook.
                </li>
                <li>
                  <strong>Textbook foundations</strong> — Jurafsky &amp;
                  Martin&apos;s Speech and Language Processing. Rigorous and
                  math-heavy.
                </li>
              </ol>
              <p className="text-sm mt-3">Which approach sounds right?</p>
            </MockMessage>
          </MockThread>
        </div>

        {/* "With" panel */}
        <div
          className={cn(
            "transition-opacity duration-500 ease-in-out",
            activeTab === "with"
              ? "relative opacity-100"
              : "pointer-events-none absolute inset-0 opacity-0"
          )}
        >
          <MockThread>
            <MockMessage role="user">
              I want to understand how LLMs work. Where should I start?
            </MockMessage>
            <MockMessage role="assistant">
              <p className="text-sm mb-3">
                Three paths depending on how you like to learn:
              </p>
              <div className="mt-2">
                <OptionList
                  id="overview-learn-llms"
                  selectionMode="single"
                  options={[
                    { id: "visual", label: "Visual intuition first" },
                    {
                      id: "code",
                      label: "Code-first, build a transformer",
                    },
                    { id: "textbook", label: "Textbook foundations" },
                  ]}
                />
              </div>
            </MockMessage>
          </MockThread>
        </div>
      </div>
    </div>
  );
}
