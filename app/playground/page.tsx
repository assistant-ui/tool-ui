"use client";

import { ChatPane } from "./chat-pane";
import type { ChatPaneRef } from "./chat-pane";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RotateCcw, Copy, Check } from "lucide-react";
import { listPrototypes } from "@/lib/playground";
import type { Prototype } from "@/lib/playground";
import { ToolInspector } from "./tool-inspector";

const PROTOTYPES = listPrototypes();

const getInitialSlug = (slugParam: string | null, prototypes: Prototype[]) => {
  if (
    slugParam &&
    prototypes.some((prototype) => prototype.slug === slugParam)
  ) {
    return slugParam;
  }
  return prototypes[0]?.slug ?? null;
};

const PlaygroundContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slugParam = searchParams.get("slug");

  const [activeSlug, setActiveSlug] = useState<string | null>(() =>
    getInitialSlug(slugParam, PROTOTYPES),
  );
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [copiedState, setCopiedState] = useState(false);
  const chatPaneRef = useRef<ChatPaneRef>(null);

  useEffect(() => {
    if (slugParam === null) {
      return;
    }
    const nextSlug = getInitialSlug(slugParam, PROTOTYPES);
    setActiveSlug((current) => (current === nextSlug ? current : nextSlug));
  }, [slugParam]);

  const resolvedSlug = activeSlug ?? PROTOTYPES[0]?.slug ?? "";

  const activePrototype = useMemo(
    () =>
      PROTOTYPES.find((prototype) => prototype.slug === resolvedSlug) ?? null,
    [resolvedSlug],
  );

  const copyChatState = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storageKey = `playground:thread:${resolvedSlug}`;
    const raw = window.localStorage.getItem(storageKey);

    let stateToShare: string;

    if (!raw) {
      stateToShare = JSON.stringify(
        {
          prototype: activePrototype?.title ?? resolvedSlug,
          slug: resolvedSlug,
          messages: [],
          note: "No messages in thread yet",
        },
        null,
        2,
      );
    } else {
      try {
        const parsed = JSON.parse(raw);
        stateToShare = JSON.stringify(
          {
            prototype: activePrototype?.title ?? resolvedSlug,
            slug: resolvedSlug,
            systemPrompt: activePrototype?.systemPrompt,
            tools: activePrototype?.tools?.map((tool) => ({
              name: tool.name,
              description: tool.description,
            })),
            ...parsed,
          },
          null,
          2,
        );
      } catch {
        stateToShare = JSON.stringify(
          {
            prototype: activePrototype?.title ?? resolvedSlug,
            slug: resolvedSlug,
            error: "Failed to parse chat state",
            rawState: raw,
          },
          null,
          2,
        );
      }
    }

    navigator.clipboard
      .writeText(stateToShare)
      .then(() => {
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
      })
      .catch((error) => {
        console.error("Failed to copy chat state", error);
      });
  }, [resolvedSlug, activePrototype]);

  useEffect(() => {
    if (!activePrototype) {
      return;
    }
    if (slugParam === activePrototype.slug) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const nextSearch = new URLSearchParams(window.location.search);
    nextSearch.set("slug", activePrototype.slug);
    router.replace(`?${nextSearch.toString()}`, { scroll: false });
  }, [slugParam, activePrototype, router]);

  if (PROTOTYPES.length === 0 || !activePrototype) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Playground</CardTitle>
            <CardDescription>
              Add a prototype definition to `lib/playground/registry.ts` to get
              started.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <p>Example entry:</p>
            <pre className="bg-muted text-muted-foreground rounded-lg p-3 text-xs">
              {`const prototype: Prototype = {
  slug: "my-prototype",
  title: "My Prototype",
  systemPrompt: "You are a helpful assistant...",
  tools: [{ name: "my_tool", description: "Does something", execute: mockTool({ ok: true }) }],
};`}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden">
      <aside className="border-border/60 bg-muted/30 flex w-64 flex-col overflow-hidden border-r">
        <div className="border-border/60 border-b px-4 py-5">
          <h1 className="text-lg font-semibold">Tool UI Playground</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <div className="flex flex-col gap-2">
            {PROTOTYPES.map((prototype) => {
              const isActive = prototype.slug === activePrototype.slug;
              return (
                <Button
                  key={prototype.slug}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start py-4"
                  onClick={() => setActiveSlug(prototype.slug)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {prototype.title}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="border-border bg-background/95 flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold">{activePrototype.title}</h2>
            {activePrototype.summary ? (
              <p className="text-muted-foreground text-sm">
                {activePrototype.summary}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={copyChatState}
              title="Copy chat state for debugging"
            >
              {copiedState ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => chatPaneRef.current?.resetThread()}
              title="Reset thread"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setInspectorOpen(true)}>
              View tools
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatPane
            key={activePrototype.slug}
            ref={chatPaneRef}
            prototype={activePrototype}
          />
        </div>
      </main>
      <ToolInspector
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        tools={activePrototype.tools}
        prototypeTitle={activePrototype.title}
      />
    </div>
  );
};

const PlaygroundPage = () => (
  <Suspense
    fallback={
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Tool UI Playground</CardTitle>
            <CardDescription>Loading playground…</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }
  >
    <PlaygroundContent />
  </Suspense>
);

export default PlaygroundPage;
