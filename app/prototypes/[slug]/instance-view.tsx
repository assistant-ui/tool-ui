"use client";

import {
  ActionBarPrimitive,
  AssistantRuntimeProvider,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantState,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ThreadList } from "@/app/components/assistant-ui/thread-list";
import { MarkdownText } from "@/app/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/app/components/assistant-ui/tool-fallback";
import { getCloudClientEnv } from "@/lib/assistant/cloud-client";
import {
  consumePendingReplay,
  ensureThreadMeta,
  getThreadHistoryStore,
  getThreadMetaStore,
  setPendingReplay,
  setThreadMeta,
  setThreadSnapshot,
  subscribeThreadHistoryStore,
  subscribeThreadMetaStore,
} from "@/lib/assistant/thread-meta";
import type { InstanceManifest } from "@/lib/instances";

type InstanceSummary = {
  slug: string;
  name: string;
  version: string;
};

type ManifestOverrides = Pick<InstanceManifest, "tools" | "uiMap">;

type InstanceViewProps = {
  manifest: InstanceManifest;
  instances: InstanceSummary[];
  searchParams: Record<string, string | string[] | undefined>;
};

type CloudMode = "local" | "hybrid" | "cloud";
type EffectiveMode = CloudMode | "local-fallback";

export const InstanceView = ({
  manifest,
  instances,
  searchParams,
}: InstanceViewProps) => {
  const cloudEnv = useMemo(() => getCloudClientEnv(), []);
  const defaultMode: CloudMode =
    manifest.cloud?.mode ?? (cloudEnv.available ? "hybrid" : "local");

  const [requestedMode, setRequestedMode] = useState<CloudMode>(defaultMode);

  useEffect(() => {
    setRequestedMode(defaultMode);
  }, [defaultMode, manifest.meta.slug]);

  const effectiveMode: EffectiveMode =
    requestedMode === "local" || cloudEnv.available
      ? requestedMode
      : "local-fallback";

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: `/api/prototypes/${manifest.meta.slug}/chat`,
        headers: async () => ({
          "X-Assistant-Instance": manifest.meta.slug,
          "X-Assistant-Mode": effectiveMode,
        }),
      }),
    [manifest.meta.slug, effectiveMode],
  );

  const generateId = useCallback(() => {
    const random =
      globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    return `${manifest.meta.slug}-${random}`;
  }, [manifest.meta.slug]);

  const runtime = useChatRuntime({
    transport,
    generateId,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <InstanceContent
        manifest={manifest}
        instances={instances}
        searchParams={searchParams}
        requestedMode={requestedMode}
        effectiveMode={effectiveMode}
        setRequestedMode={setRequestedMode}
        cloudEnv={cloudEnv}
      />
    </AssistantRuntimeProvider>
  );
};

type InstanceContentProps = {
  manifest: InstanceManifest;
  instances: InstanceSummary[];
  searchParams: Record<string, string | string[] | undefined>;
  requestedMode: CloudMode;
  effectiveMode: EffectiveMode;
  setRequestedMode: (mode: CloudMode) => void;
  cloudEnv: ReturnType<typeof getCloudClientEnv>;
};

const InstanceContent = ({
  manifest,
  instances,
  searchParams,
  requestedMode,
  effectiveMode,
  setRequestedMode,
  cloudEnv,
}: InstanceContentProps) => {
  const router = useRouter();
  const commitSha =
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ??
    undefined;

  const overridesStorageKey = useMemo(
    () => `assistant:instance-overrides:${manifest.meta.slug}`,
    [manifest.meta.slug],
  );
  const [localOverrides, setLocalOverrides] =
    useState<ManifestOverrides | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [editorError, setEditorError] = useState<string | null>(null);

  const [replayDialogThread, setReplayDialogThread] = useState<string | null>(
    null,
  );
  const [replayTarget, setReplayTarget] = useState<string>(manifest.meta.slug);
  const [localReplayThread, setLocalReplayThread] = useState<string | null>(
    null,
  );
  const [forkDialogOpen, setForkDialogOpen] = useState(false);

  const threadMetaStore = useSyncExternalStore(
    subscribeThreadMetaStore,
    getThreadMetaStore,
    getThreadMetaStore,
  );
  const threadHistoryStore = useSyncExternalStore(
    subscribeThreadHistoryStore,
    getThreadHistoryStore,
    getThreadHistoryStore,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      setLocalOverrides(null);
      return;
    }
    const raw = window.localStorage.getItem(overridesStorageKey);
    if (!raw) {
      setLocalOverrides(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as ManifestOverrides;
      if (
        parsed &&
        Array.isArray(parsed.tools) &&
        parsed.uiMap &&
        typeof parsed.uiMap === "object"
      ) {
        setLocalOverrides(parsed);
      } else {
        setLocalOverrides(null);
      }
    } catch (error) {
      console.warn("Failed to parse manifest overrides", error);
      setLocalOverrides(null);
    }
  }, [overridesStorageKey]);

  useEffect(() => {
    if (!editorOpen) return;
    const draft = localOverrides ?? {
      tools: manifest.tools,
      uiMap: manifest.uiMap,
    };
    setEditorValue(JSON.stringify(draft, null, 2));
    setEditorError(null);
  }, [editorOpen, localOverrides, manifest.tools, manifest.uiMap]);

  const activeManifest = useMemo(() => {
    if (!localOverrides) {
      return manifest;
    }
    return {
      ...manifest,
      tools: localOverrides.tools,
      uiMap: localOverrides.uiMap,
    };
  }, [manifest, localOverrides]);

  const threadsState = useAssistantState(
    useCallback((state) => state.threads, []),
  );
  const threadIds = threadsState.threadIds;
  const newThreadId = threadsState.newThreadId ?? null;

  const activeThreadId = threadsState.mainThreadId ?? null;
  const activeThreadMessages = useAssistantState(
    useCallback((state) => state.thread?.messages ?? [], []),
  );

  const buildThreadMeta = useCallback(() => {
    return {
      instanceSlug: manifest.meta.slug,
      configVersion: manifest.meta.version,
      deploymentId: manifest.cloud?.deploymentId,
      forkedFrom: manifest.meta.forkOf,
      commitSha,
      createdAt: new Date().toISOString(),
      tags: [],
    };
  }, [
    commitSha,
    manifest.cloud?.deploymentId,
    manifest.meta.forkOf,
    manifest.meta.slug,
    manifest.meta.version,
  ]);

  useEffect(() => {
    threadIds.forEach((id) => ensureThreadMeta(id, buildThreadMeta));
  }, [threadIds, buildThreadMeta]);

  const lastNewThreadRef = useRef<string | null>(null);
  useEffect(() => {
    if (!newThreadId || newThreadId === lastNewThreadRef.current) return;
    lastNewThreadRef.current = newThreadId;
    setThreadMeta(newThreadId, buildThreadMeta());
  }, [newThreadId, buildThreadMeta]);

  useEffect(() => {
    if (!activeThreadId) return;
    setThreadSnapshot(activeThreadId, {
      messages: activeThreadMessages,
      updatedAt: new Date().toISOString(),
    });
  }, [activeThreadId, activeThreadMessages]);

  const allowedThreadIds = useMemo(() => {
    return new Set(
      Object.entries(threadMetaStore)
        .filter(([, meta]) => meta.instanceSlug === manifest.meta.slug)
        .map(([id]) => id),
    );
  }, [threadMetaStore, manifest.meta.slug]);

  useEffect(() => {
    const defaultTarget =
      instances.find((instance) => instance.slug !== manifest.meta.slug)
        ?.slug ?? manifest.meta.slug;
    setReplayTarget(defaultTarget);
  }, [instances, manifest.meta.slug]);

  const replayParam = searchParams?.replay;
  const hasReplayRequest = Array.isArray(replayParam)
    ? replayParam.length > 0
    : Boolean(replayParam);

  useEffect(() => {
    if (!hasReplayRequest) return;
    const payload = consumePendingReplay();
    if (payload?.threadId) {
      setLocalReplayThread(payload.threadId);
    }
    router.replace(`/prototypes/${manifest.meta.slug}`, { scroll: false });
  }, [hasReplayRequest, manifest.meta.slug, router]);

  const handleSaveOverrides = () => {
    try {
      const parsed = JSON.parse(editorValue) as ManifestOverrides;
      if (!Array.isArray(parsed.tools)) {
        throw new Error("Expected a `tools` array");
      }
      if (!parsed.uiMap || typeof parsed.uiMap !== "object") {
        throw new Error("Expected a `uiMap` object");
      }

      const overrides: ManifestOverrides = {
        tools: parsed.tools,
        uiMap: parsed.uiMap,
      };
      setLocalOverrides(overrides);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          overridesStorageKey,
          JSON.stringify(overrides),
        );
      }
      setEditorError(null);
      setEditorOpen(false);
    } catch (error) {
      setEditorError(
        error instanceof Error
          ? error.message
          : "Failed to parse overrides JSON",
      );
    }
  };

  const handleResetOverrides = () => {
    setLocalOverrides(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(overridesStorageKey);
    }
    setEditorError(null);
    setEditorOpen(false);
  };

  const handleReplayRequest = (threadId: string) => {
    setReplayDialogThread(threadId);
  };

  const handleReplayConfirm = () => {
    if (!replayDialogThread) return;

    if (replayTarget === manifest.meta.slug) {
      setLocalReplayThread(replayDialogThread);
      setReplayDialogThread(null);
      return;
    }

    setPendingReplay({
      threadId: replayDialogThread,
      sourceSlug: manifest.meta.slug,
      requestedAt: new Date().toISOString(),
    });
    setReplayDialogThread(null);
    router.push(`/prototypes/${replayTarget}?replay=1`);
  };

  const replayMeta = localReplayThread
    ? threadMetaStore[localReplayThread]
    : undefined;
  const replaySnapshot = localReplayThread
    ? threadHistoryStore[localReplayThread]
    : undefined;

  const suggestedForkSlug = useMemo(() => {
    const match = manifest.meta.slug.match(/-v(\d+)$/);
    if (match) {
      const next = Number.parseInt(match[1], 10) + 1;
      return manifest.meta.slug.replace(/-v\d+$/, `-v${next}`);
    }
    return `${manifest.meta.slug}-v2`;
  }, [manifest.meta.slug]);

  const suggestedForkVersion = useMemo(() => {
    const current = manifest.meta.version;
    if (!current) return "1.0.0";
    const segments = current.split(".");
    const numeric = segments.map((segment) => Number.parseInt(segment, 10));
    if (numeric.some((value) => Number.isNaN(value))) {
      return `${current}-fork`;
    }
    numeric[numeric.length - 1] += 1;
    return numeric.join(".");
  }, [manifest.meta.version]);

  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const threadStats = useMemo(() => {
    if (!isHydrated) {
      return {
        threadCount: null,
        lastUpdated: null,
      };
    }

    const ids = Array.from(allowedThreadIds);
    const timestamps = ids
      .map((id) => threadHistoryStore[id]?.updatedAt)
      .filter((value): value is string => Boolean(value))
      .map((value) => Date.parse(value))
      .filter((value) => Number.isFinite(value));

    const lastUpdated =
      timestamps.length > 0
        ? new Date(Math.max(...timestamps)).toISOString()
        : null;

    return {
      threadCount: ids.length,
      lastUpdated,
    };
  }, [isHydrated, allowedThreadIds, threadHistoryStore]);

  return (
    <>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
        <Sidebar
          manifest={manifest}
          tools={activeManifest.tools}
          uiMap={activeManifest.uiMap}
          requestedMode={requestedMode}
          effectiveMode={effectiveMode}
          cloudAvailable={cloudEnv.available}
          onModeChange={setRequestedMode}
          allowedThreadIds={allowedThreadIds}
          onReplay={handleReplayRequest}
          onForkRequest={() => setForkDialogOpen(true)}
        />
        <main className="flex flex-1 flex-col">
          <ModeBanner
            requestedMode={requestedMode}
            effectiveMode={effectiveMode}
            missingEnv={cloudEnv.missing}
          />
          <ToolsPanel
            tools={activeManifest.tools}
            uiMap={activeManifest.uiMap}
            onEdit={() => setEditorOpen(true)}
          />
          {localReplayThread && (
            <ReplayPanel
              threadId={localReplayThread}
              meta={replayMeta}
              snapshot={replaySnapshot}
              onClose={() => setLocalReplayThread(null)}
              currentInstance={manifest.meta.slug}
            />
          )}
          <MetricsPanel
            mode={manifest.cloud?.mode ?? "local"}
            deploymentId={manifest.cloud?.deploymentId}
            threadCount={threadStats.threadCount}
            lastUpdated={threadStats.lastUpdated}
          />
          <ThreadArea manifest={activeManifest} />
        </main>
      </div>
      <ReplayDialog
        open={Boolean(replayDialogThread)}
        onOpenChange={(open) => !open && setReplayDialogThread(null)}
        instances={instances}
        currentSlug={manifest.meta.slug}
        selectedSlug={replayTarget}
        onSelectedSlugChange={setReplayTarget}
        onConfirm={handleReplayConfirm}
      />
      <ForkDialog
        open={forkDialogOpen}
        onOpenChange={setForkDialogOpen}
        sourceSlug={manifest.meta.slug}
        suggestedSlug={suggestedForkSlug}
        suggestedVersion={suggestedForkVersion}
      />
      <ToolEditorDialog
        open={editorOpen}
        value={editorValue}
        error={editorError}
        storageKey={overridesStorageKey}
        onOpenChange={setEditorOpen}
        onChange={(next) => {
          setEditorValue(next);
          setEditorError(null);
        }}
        onSave={handleSaveOverrides}
        onReset={handleResetOverrides}
      />
    </>
  );
};

type SidebarProps = {
  manifest: InstanceManifest;
  tools: InstanceManifest["tools"];
  uiMap: InstanceManifest["uiMap"];
  requestedMode: CloudMode;
  effectiveMode: EffectiveMode;
  cloudAvailable: boolean;
  onModeChange: (mode: CloudMode) => void;
  allowedThreadIds: Set<string>;
  onReplay: (threadId: string) => void;
  onForkRequest: () => void;
};

const Sidebar = ({
  manifest,
  tools,
  uiMap,
  requestedMode,
  effectiveMode,
  cloudAvailable,
  onModeChange,
  allowedThreadIds,
  onReplay,
  onForkRequest,
}: SidebarProps) => (
  <aside className="border-border/80 bg-muted/10 flex flex-col gap-4 border-b p-6 lg:w-72 lg:border-r lg:border-b-0">
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">
        Instance
      </p>
      <h1 className="text-lg leading-tight font-semibold">
        {manifest.meta.name}
      </h1>
      <p className="text-muted-foreground text-sm">
        {manifest.meta.description}
      </p>
    </div>
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Version
          </p>
          <p className="font-medium">{manifest.meta.version}</p>
        </div>
        {manifest.meta.forkOf && (
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Forked from
            </p>
            <p className="font-medium">{manifest.meta.forkOf}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Model
          </p>
          <p className="font-medium">{manifest.runtime.model}</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="space-y-2 p-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Tools
          </p>
          <p className="text-muted-foreground text-sm">
            Detailed configuration coming soon.
          </p>
        </div>
        <ul className="space-y-1 text-sm">
          {tools.map((tool) => {
            const activeUi =
              uiMap[tool.name] ?? tool.defaultUI ?? "tool-fallback";
            return (
              <li key={tool.name} className="flex items-center justify-between">
                <span className="font-medium">{tool.name}</span>
                <span className="text-muted-foreground text-xs">
                  {activeUi}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Runtime mode
            </p>
            <p className="text-sm font-medium capitalize">
              {effectiveMode === "local-fallback"
                ? "Local (fallback)"
                : effectiveMode}
            </p>
          </div>
          <Select
            value={requestedMode}
            onValueChange={(value) => onModeChange(value as CloudMode)}
          >
            <SelectTrigger className="h-9 w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="hybrid" disabled={!cloudAvailable}>
                Hybrid
              </SelectItem>
              <SelectItem value="cloud" disabled={!cloudAvailable}>
                Cloud
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {!cloudAvailable && requestedMode !== "local" && (
          <p className="text-muted-foreground text-xs">
            Cloud environment variables missing; falling back to local.
          </p>
        )}
      </CardContent>
    </Card>
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Threads
          </p>
          <p className="text-muted-foreground text-sm">
            Conversations scoped to this instance.
          </p>
        </div>
        <ThreadList
          allowedThreadIds={allowedThreadIds}
          newLabel="New conversation"
          emptyState={
            <p className="text-muted-foreground text-xs">
              Start chatting to create a thread.
            </p>
          }
          onReplay={onReplay}
        />
      </CardContent>
    </Card>
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Fork
          </p>
          <p className="text-muted-foreground text-sm">
            Duplicate this instance to branch experiments safely.
          </p>
        </div>
        <Button onClick={onForkRequest}>Fork instance</Button>
      </CardContent>
    </Card>
  </aside>
);

type ModeBannerProps = {
  requestedMode: CloudMode;
  effectiveMode: EffectiveMode;
  missingEnv: string[];
};

const ModeBanner = ({
  requestedMode,
  effectiveMode,
  missingEnv,
}: ModeBannerProps) => {
  if (effectiveMode === "local" && requestedMode === "local") return null;

  const isFallback = effectiveMode === "local-fallback";
  const bannerClasses = isFallback
    ? "bg-destructive/15 border-destructive/50 text-destructive"
    : "bg-secondary/40 border-border/70 text-foreground";

  return (
    <div className={`${bannerClasses} border-b px-4 py-3 text-sm`}>
      {isFallback ? (
        <div className="flex flex-col gap-1">
          <p className="font-medium">
            Cloud mode requested, but configuration is incomplete. Using local
            mode for now.
          </p>
          {missingEnv.length > 0 && (
            <p className="text-xs">
              Missing env vars:{" "}
              <span className="font-mono">{missingEnv.join(", ") || "—"}</span>
            </p>
          )}
        </div>
      ) : (
        <p>
          Running in <span className="font-semibold">{effectiveMode}</span>{" "}
          mode. Switch modes from the sidebar to test different deployments.
        </p>
      )}
    </div>
  );
};

const ThreadArea = ({ manifest }: { manifest: InstanceManifest }) => (
  <ThreadPrimitive.Root className="flex h-full flex-1 flex-col">
    <ThreadPrimitive.Viewport className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
      <ThreadPrimitive.If empty>
        <div className="text-muted-foreground mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="text-base font-medium">
            Start exploring {manifest.meta.name}
          </p>
          <p className="text-sm">
            Describe a task or ask a question to see how this tool collection
            responds.
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
    <div className="border-border bg-background border-t px-4 py-4">
      <Composer />
    </div>
  </ThreadPrimitive.Root>
);

type ToolsPanelProps = {
  tools: InstanceManifest["tools"];
  uiMap: InstanceManifest["uiMap"];
  onEdit: () => void;
};

const ToolsPanel = ({ tools, uiMap, onEdit }: ToolsPanelProps) => {
  return (
    <div className="border-border/70 bg-background/40 mx-4 mt-4 rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Tools</p>
          <p className="text-muted-foreground text-xs">
            Current tool configuration for this instance. UI reassignment coming
            soon.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit JSON
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-48">Assigned UI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools.map((tool) => {
            const activeUi =
              uiMap[tool.name] ?? tool.defaultUI ?? "tool-fallback";
            const candidates = new Set<string>([
              activeUi,
              ...(tool.uiCandidates ?? []),
            ]);
            return (
              <TableRow key={tool.name}>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {tool.description}
                </TableCell>
                <TableCell>
                  <Select value={activeUi} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...candidates].map((uiId) => (
                        <SelectItem key={uiId} value={uiId}>
                          {uiId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const UserMessage = () => (
  <MessagePrimitive.Root className="mx-auto w-full max-w-2xl py-3">
    <div className="ml-auto flex max-w-[85%] flex-col items-end gap-1">
      <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2">
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>
      <UserActionBar />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage = () => (
  <MessagePrimitive.Root className="mx-auto w-full max-w-2xl py-3">
    <div className="flex max-w-[85%] flex-col gap-3">
      <MessagePrimitive.Content
        components={{
          Text: MarkdownText,
          tools: { Fallback: ToolFallback },
        }}
      />
      <MessagePrimitive.Error>
        <ErrorPrimitive.Root className="border-destructive/60 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          <ErrorPrimitive.Message />
        </ErrorPrimitive.Root>
      </MessagePrimitive.Error>
      <AssistantActionBar />
    </div>
  </MessagePrimitive.Root>
);

const UserActionBar = () => (
  <ActionBarPrimitive.Root
    hideWhenRunning
    autohide="not-last"
    className="text-muted-foreground flex gap-2 text-xs"
  >
    <ActionBarPrimitive.Edit asChild>
      <Button variant="ghost" size="sm">
        Edit
      </Button>
    </ActionBarPrimitive.Edit>
  </ActionBarPrimitive.Root>
);

const AssistantActionBar = () => (
  <ActionBarPrimitive.Root
    hideWhenRunning
    autohide="not-last"
    className="text-muted-foreground flex gap-2 text-xs"
  >
    <ActionBarPrimitive.Copy asChild>
      <Button variant="ghost" size="sm">
        Copy
      </Button>
    </ActionBarPrimitive.Copy>
    <ActionBarPrimitive.Reload asChild>
      <Button variant="ghost" size="sm">
        Retry
      </Button>
    </ActionBarPrimitive.Reload>
  </ActionBarPrimitive.Root>
);

const Composer = () => (
  <ComposerPrimitive.Root className="border-input bg-background flex w-full flex-col rounded-3xl border px-1 pt-2 shadow-sm transition-all">
    <ComposerPrimitive.Input
      placeholder="Send a message..."
      className="placeholder:text-muted-foreground max-h-48 min-h-16 w-full resize-none bg-transparent px-4 pb-3 text-base outline-none"
      rows={1}
      autoFocus
    />
    <div className="mx-3 mb-2 flex items-center justify-end gap-2">
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button variant="outline" size="sm">
            Stop
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <Button size="sm">Send</Button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
    </div>
  </ComposerPrimitive.Root>
);

type ReplayDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instances: InstanceSummary[];
  currentSlug: string;
  selectedSlug: string;
  onSelectedSlugChange: (slug: string) => void;
  onConfirm: () => void;
};

const ReplayDialog = ({
  open,
  onOpenChange,
  instances,
  currentSlug,
  selectedSlug,
  onSelectedSlugChange,
  onConfirm,
}: ReplayDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Replay conversation</DialogTitle>
        <DialogDescription>
          Render this conversation using a different instance configuration.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          Choose which instance should be used for replay:
        </p>
        <Select
          value={selectedSlug}
          onValueChange={(value) => onSelectedSlugChange(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {instances.map((instance) => (
              <SelectItem key={instance.slug} value={instance.slug}>
                {instance.name}{" "}
                <span className="text-muted-foreground text-xs">
                  (v{instance.version}
                  {instance.slug === currentSlug ? " • current" : ""})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>Replay</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

type ReplayPanelProps = {
  threadId: string;
  meta?: ReturnType<typeof getThreadMetaStore>[string];
  snapshot?: ReturnType<typeof getThreadHistoryStore>[string];
  onClose: () => void;
  currentInstance: string;
};

const ReplayPanel = ({
  threadId,
  meta,
  snapshot,
  onClose,
  currentInstance,
}: ReplayPanelProps) => {
  const messages = Array.isArray(snapshot?.messages)
    ? (snapshot?.messages as Array<{
        id: string;
        role: string;
        content?: Array<{ type: string; text?: string }>;
      }>)
    : [];

  return (
    <div className="border-border/60 bg-secondary/30 mx-4 mt-4 rounded-lg border px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            Replay of thread{" "}
            <span className="font-mono text-xs">{threadId}</span>
          </p>
          <p className="text-muted-foreground text-xs">
            Source instance: {meta?.instanceSlug ?? "unknown"} • Viewing inside{" "}
            {currentInstance}
          </p>
          <p className="text-muted-foreground text-xs">
            Snapshot captured: {snapshot?.updatedAt ?? "unknown"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Dismiss
        </Button>
      </div>
      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            No cached messages available for this thread.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <p className="font-semibold capitalize">{message.role}</p>
              <p className="text-muted-foreground text-xs whitespace-pre-wrap">
                {message.content
                  ?.map((part) => part.text ?? "")
                  .filter(Boolean)
                  .join("\n")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

type ToolEditorDialogProps = {
  open: boolean;
  value: string;
  error: string | null;
  storageKey: string;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onReset: () => void;
};

const ToolEditorDialog = ({
  open,
  value,
  error,
  storageKey,
  onOpenChange,
  onChange,
  onSave,
  onReset,
}: ToolEditorDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Edit tools JSON</DialogTitle>
        <DialogDescription>
          Draft changes are stored locally. Fork and update the manifest to
          share with your team.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-72 font-mono text-sm"
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <p className="text-muted-foreground text-xs">
          Storage key:
          <span className="text-foreground ml-1 font-mono">{storageKey}</span>
        </p>
      </div>
      <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onReset}>
          Reset overrides
        </Button>
        <Button onClick={onSave}>Save overrides</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

type MetricsPanelProps = {
  mode: string;
  deploymentId?: string;
  threadCount: number | null;
  lastUpdated: string | null;
};

const MetricsPanel = ({
  mode,
  deploymentId,
  threadCount,
  lastUpdated,
}: MetricsPanelProps) => {
  const formattedLastUpdated =
    lastUpdated !== null
      ? new Date(lastUpdated).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  return (
    <Card className="border-border/70 bg-background/40 mx-4 mt-4">
      <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Cloud mode" value={mode} />
        <MetricTile label="Deployment" value={deploymentId ?? "Not set"} mono />
        <MetricTile
          label="Threads"
          value={threadCount === null ? "—" : threadCount.toString()}
        />
        <MetricTile label="Last activity" value={formattedLastUpdated} />
      </CardContent>
    </Card>
  );
};

type MetricTileProps = {
  label: string;
  value: string;
  mono?: boolean;
};

const MetricTile = ({ label, value, mono }: MetricTileProps) => (
  <div className="border-border/60 bg-background/60 rounded-md border px-3 py-4">
    <p className="text-muted-foreground text-xs tracking-wide uppercase">
      {label}
    </p>
    <p
      className={`mt-1 text-base font-semibold ${
        mono ? "font-mono text-sm" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

type ForkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceSlug: string;
  suggestedSlug: string;
  suggestedVersion: string;
};

const ForkDialog = ({
  open,
  onOpenChange,
  sourceSlug,
  suggestedSlug,
  suggestedVersion,
}: ForkDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Fork instance</DialogTitle>
        <DialogDescription>
          Duplicate this manifest, tweak tools or UIs, and iterate safely.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            Recommended new slug:
            <span className="text-foreground ml-1 font-mono">
              {suggestedSlug}
            </span>
          </p>
          <p className="text-muted-foreground">
            Suggested version:
            <span className="text-foreground ml-1 font-mono">
              {suggestedVersion}
            </span>
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Run this command in the repo:
          </p>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-md px-3 py-2 text-sm">
            {`pnpm fork:instance ${sourceSlug} ${suggestedSlug} ${suggestedVersion}`}
          </pre>
          <p className="text-muted-foreground text-xs leading-relaxed">
            The script copies the manifest, resets the deployment id, and
            registers the new instance. Afterwards you can iterate on tools and
            UIs independently.
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
