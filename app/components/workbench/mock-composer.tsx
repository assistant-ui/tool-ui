"use client";

import { useRef, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/ui/cn";

export function MockComposer() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;

    const lineHeight =
      parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
    setIsMultiline(scrollHeight > lineHeight * 1.5);
  }, []);

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-4">
      <div
        className={cn(
          "relative flex min-h-14 w-full max-w-2xl items-center border border-neutral-200 bg-white pr-2 pl-6 shadow-sm",
          isMultiline ? "rounded-3xl py-2" : "rounded-full py-2",
        )}
      >
        <textarea
          ref={textareaRef}
          placeholder="Send a message..."
          rows={1}
          onInput={handleInput}
          className="max-h-[300px] w-full resize-none self-center bg-transparent pr-12 text-base leading-6 text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />
        <button
          type="button"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-white",
            isMultiline && "absolute right-2 bottom-2",
          )}
        >
          <ArrowUp className="size-5 text-white dark:text-neutral-900" />
        </button>
      </div>
    </div>
  );
}
