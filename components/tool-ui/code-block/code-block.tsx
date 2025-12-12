"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { codeToHtml } from "shiki";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { CodeBlockProps } from "./schema";
import {
  ActionButtons,
  normalizeActionsConfig,
  useCopyToClipboard,
} from "../shared";
import { Button, Collapsible, CollapsibleTrigger } from "./_ui";
import { cn } from "./_cn";
import { CodeBlockProgress } from "./progress";

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  tsx: "TSX",
  jsx: "JSX",
  json: "JSON",
  bash: "Bash",
  shell: "Shell",
  css: "CSS",
  html: "HTML",
  markdown: "Markdown",
  sql: "SQL",
  yaml: "YAML",
  go: "Go",
  rust: "Rust",
  text: "Plain Text",
};

function getLanguageDisplayName(lang: string): string {
  return LANGUAGE_DISPLAY_NAMES[lang.toLowerCase()] || lang.toUpperCase();
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getDocumentTheme(): "light" | "dark" | null {
  if (typeof document === "undefined") return null;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  return null;
}

function useResolvedTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return getDocumentTheme() ?? getSystemTheme();
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const update = () => setTheme(getDocumentTheme() ?? getSystemTheme());

    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    mql?.addEventListener("change", update);

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mql?.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  return theme;
}

export function CodeBlock({
  id,
  code,
  language = "text",
  filename,
  showLineNumbers = true,
  highlightLines,
  maxCollapsedLines,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
  isLoading,
  className,
}: CodeBlockProps) {
  const resolvedTheme = useResolvedTheme();
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { copiedId, copy } = useCopyToClipboard();
  const copied = copiedId === "code";

  const theme = resolvedTheme === "dark" ? "github-dark" : "github-light";

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("");
        return;
      }

      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme,
          transformers: [
            {
              line(node, line) {
                node.properties["data-line"] = line;
                if (highlightLines?.includes(line)) {
                  node.properties["class"] =
                    `${node.properties["class"] || ""} highlighted-line`;
                }
              },
            },
          ],
        });
        setHighlightedHtml(html);
      } catch {
        const escaped = code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        setHighlightedHtml(`<pre><code>${escaped}</code></pre>`);
      }
    }
    highlight();
  }, [code, language, theme, highlightLines]);

  const normalizedFooterActions = useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  const lineCount = code.split("\n").length;
  const shouldCollapse = maxCollapsedLines && lineCount > maxCollapsedLines;
  const isCollapsed = shouldCollapse && !isExpanded;

  const handleCopy = useCallback(() => {
    copy(code, "code");
  }, [code, copy]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "@container flex w-full min-w-80 flex-col gap-3",
          className,
        )}
        data-tool-ui-id={id}
        aria-busy="true"
      >
        <div className="border-border bg-card overflow-hidden rounded-lg border shadow-xs">
          <CodeBlockProgress />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "@container flex w-full min-w-80 flex-col gap-3",
        className,
      )}
      data-tool-ui-id={id}
      data-slot="code-block"
    >
      <div className="border-border bg-card overflow-hidden rounded-lg border shadow-xs">
        <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">
              {getLanguageDisplayName(language)}
            </span>
            {filename && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-foreground text-xs font-medium">
                  {filename}
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 w-7 p-0"
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
        </div>

        <Collapsible open={!isCollapsed}>
          <div
            className={cn(
              "overflow-x-auto text-sm",
              showLineNumbers && "[&_.line]:pl-4 [&_pre]:pl-0",
              "[&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-4",
              "[&_.highlighted-line]:bg-primary/10 [&_.highlighted-line]:border-primary [&_.highlighted-line]:border-l-2",
              isCollapsed && "max-h-[200px] overflow-hidden",
            )}
          >
            {highlightedHtml ? (
              <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            ) : (
              <pre className="p-4">
                <code>{code}</code>
              </pre>
            )}
          </div>

          {shouldCollapse && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full rounded-none border-t py-2"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show all {lineCount} lines
                  </>
                ) : (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Collapse
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </div>

      {normalizedFooterActions && (
        <div className="@container/actions">
          <ActionButtons
            actions={normalizedFooterActions.items}
            align={normalizedFooterActions.align}
            confirmTimeout={normalizedFooterActions.confirmTimeout}
            onAction={(id) => onResponseAction?.(id)}
            onBeforeAction={onBeforeResponseAction}
          />
        </div>
      )}
    </div>
  );
}
