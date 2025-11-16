"use client";

import { AssistantRuntimeProvider, ThreadPrimitive } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listPrototypes } from "@/lib/playground";
import type { Prototype } from "@/lib/playground";
import { AssistantMessage, Composer, UserMessage } from "./chat-ui";
import { ToolInspector } from "./tool-inspector";

const PROTOTYPES = listPrototypes();
const PROTOTYPE_SLUG_HEADER = "x-prototype-slug";

const getInitialSlug = (slugParam: string | null, prototypes: Prototype[]) => {
  if (
    slugParam &&
    prototypes.some((prototype) => prototype.slug === slugParam)
  ) {
    return slugParam;
  }
  return prototypes[0]?.slug ?? null;
};

const PlaygroundPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slugParam = searchParams.get("slug");

  const [activeSlug, setActiveSlug] = useState<string | null>(() =>
    getInitialSlug(slugParam, PROTOTYPES),
  );
  const [inspectorOpen, setInspectorOpen] = useState(false);

  useEffect(() => {
    const nextSlug = getInitialSlug(slugParam, PROTOTYPES);
    if (nextSlug && nextSlug !== activeSlug) {
      setActiveSlug(nextSlug);
    }
  }, [slugParam, activeSlug]);

  const resolvedSlug = activeSlug ?? PROTOTYPES[0]?.slug ?? "";

  const activePrototype = useMemo(
    () =>
      PROTOTYPES.find((prototype) => prototype.slug === resolvedSlug) ?? null,
    [resolvedSlug],
  );

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

  const slugRef = useRef<string>(resolvedSlug);
  useEffect(() => {
    slugRef.current = activePrototype?.slug ?? "";
  }, [activePrototype]);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/playground/chat",
        headers: async () => ({
          [PROTOTYPE_SLUG_HEADER.toUpperCase()]: slugRef.current,
        }),
      }),
    [],
  );

  const runtime = useChatRuntime({ transport });

  if (PROTOTYPES.length === 0 || !activePrototype) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Playground</CardTitle>
            <CardDescription>
              Add a prototype definition to `lib/playground/registry.ts` to
              get started.
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
          <div className="space-y-2">
            {PROTOTYPES.map((prototype) => {
              const isActive = prototype.slug === activePrototype.slug;
              return (
                <Button
                  key={prototype.slug}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSlug(prototype.slug)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {prototype.title}
                    </span>
                    {prototype.summary ? (
                      <span className="text-muted-foreground text-xs">
                        {prototype.summary}
                      </span>
                    ) : null}
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
          <Button variant="outline" onClick={() => setInspectorOpen(true)}>
            View tools
          </Button>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <AssistantRuntimeProvider runtime={runtime}>
            <ThreadPrimitive.Root className="flex flex-1 flex-col overflow-hidden">
              <ThreadPrimitive.Viewport className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
                <ThreadPrimitive.If empty>
                  <div className="text-muted-foreground mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-3 text-center">
                    <p className="text-base font-medium">
                      Start exploring {activePrototype.title}
                    </p>
                    <p className="text-sm">
                      Describe a task or ask a question to see how this tool
                      collection responds.
                    </p>
                  </div>
                </ThreadPrimitive.If>
                <ThreadPrimitive.Messages
                  components={{
                    UserMessage,
                    AssistantMessage,
                  }}
                />
              </ThreadPrimitive.Viewport>
              <div className="border-border bg-background/95 border-t px-6 py-4">
                <Composer />
              </div>
            </ThreadPrimitive.Root>
          </AssistantRuntimeProvider>
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

export default PlaygroundPage;
