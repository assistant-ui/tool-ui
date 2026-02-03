"use client";

import { useMemo, useState, useCallback, useEffect, type ReactElement } from "react";
import { createHighlighter, type Highlighter } from "shiki";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { CodeBlockProps } from "./schema";
import {
  ActionButtons,
  normalizeActionsConfig,
  useCopyToClipboard,
} from "../shared";
import { Button, cn, Collapsible, CollapsibleTrigger } from "./_adapter";
import { CodeBlockProgress } from "./progress";

const COPY_ID = "codeblock-code";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [],
    });
  }
  return highlighterPromise;
}

const htmlCache = new Map<string, string>();

function getCacheKey(
  code: string,
  language: string,
  theme: string,
  showLineNumbers: boolean,
  highlightLines?: number[],
): string {
  return `${code}::${language}::${theme}::${showLineNumbers}::${highlightLines?.join(",") ?? ""}`;
}

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

function CodeBlockRoot({
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
  className,
}: CodeBlockProps) {
  const resolvedTheme = useResolvedTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const { copiedId, copy } = useCopyToClipboard();
  const isCopied = copiedId === COPY_ID;

  const theme = resolvedTheme === "dark" ? "github-dark" : "github-light";
  const cacheKey = getCacheKey(
    code,
    language,
    theme,
    showLineNumbers,
    highlightLines,
  );

  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(
    () => htmlCache.get(cacheKey) ?? null,
  );

  useEffect(() => {
    const cached = htmlCache.get(cacheKey);
    if (cached) {
      setHighlightedHtml(cached);
      return;
    }

    let cancelled = false;

    async function highlight() {
      if (!code) {
        if (!cancelled) setHighlightedHtml("");
        return;
      }

      try {
        const highlighter = await getHighlighter();
        const loadedLangs = highlighter.getLoadedLanguages();

        if (!loadedLangs.includes(language)) {
          await highlighter.loadLanguage(
            language as Parameters<Highlighter["loadLanguage"]>[0],
          );
        }

        const lineCount = code.split("\n").length;
        const lineNumberWidth = `${String(lineCount).length + 0.5}ch`;

        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme,
          transformers: [
            {
              line(node, line) {
                node.properties["data-line"] = line;
                if (highlightLines?.includes(line)) {
                  const highlightBg =
                    resolvedTheme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)";
                  node.properties["style"] = `background:${highlightBg};`;
                }
                if (showLineNumbers) {
                  node.children.unshift({
                    type: "element",
                    tagName: "span",
                    properties: {
                      style: `display:inline-block;width:${lineNumberWidth};text-align:right;margin-right:1.5em;user-select:none;opacity:0.5;`,
                      "aria-hidden": "true",
                    },
                    children: [{ type: "text", value: String(line) }],
                  });
                }
              },
            },
          ],
        });
        if (!cancelled) {
          htmlCache.set(cacheKey, html);
          setHighlightedHtml(html);
        }
      } catch {
        const escaped = code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        if (!cancelled)
          setHighlightedHtml(`<pre><code>${escaped}</code></pre>`);
      }
    }
    void highlight();
    return () => {
      cancelled = true;
    };
  }, [
    cacheKey,
    code,
    language,
    theme,
    highlightLines,
    showLineNumbers,
    resolvedTheme,
  ]);

  const normalizedFooterActions = useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  const lineCount = code.split("\n").length;
  const shouldCollapse = maxCollapsedLines && lineCount > maxCollapsedLines;
  const isCollapsed = shouldCollapse && !isExpanded;

  const handleCopy = useCallback(() => {
    copy(code, COPY_ID);
  }, [code, copy]);

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
        <div className="bg-card flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm">
              {getLanguageDisplayName(language)}
            </span>
            {filename && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-foreground text-sm font-medium">
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
            aria-label={isCopied ? "Copied" : "Copy code"}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-700 dark:text-green-400" />
            ) : (
              <Copy className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
        </div>

        <Collapsible open={!isCollapsed}>
          <div
            className={cn(
              "overflow-x-auto overflow-y-clip text-sm [&_pre]:bg-transparent [&_pre]:py-4",
              isCollapsed && "max-h-[200px]",
            )}
          >
            {highlightedHtml && (
              <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            )}
          </div>

          {shouldCollapse && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground w-full rounded-none border-t font-normal"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="mr-1 size-4" />
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

type CodeBlockProgressProps = {
  id?: CodeBlockProps["id"];
  className?: string;
};

function CodeBlockProgressVariant({ id, className }: CodeBlockProgressProps) {
  return (
    <div
      className={cn(
        "@container flex w-full min-w-80 flex-col gap-3",
        className,
      )}
      data-tool-ui-id={id}
      data-slot="code-block"
      aria-busy="true"
    >
      <div className="border-border bg-card overflow-hidden rounded-lg border shadow-xs">
        <CodeBlockProgress />
      </div>
    </div>
  );
}

type CodeBlockComponent = {
  (props: CodeBlockProps): ReactElement;
  Progress: typeof CodeBlockProgressVariant;
};

export const CodeBlock = Object.assign(CodeBlockRoot, {
  Progress: CodeBlockProgressVariant,
}) as CodeBlockComponent;
