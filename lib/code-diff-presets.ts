import type {
  SerializableCodeDiff,
  SerializableCodeDiffFile,
  SerializableCodeDiffHunk,
} from "@/components/code-diff";


export interface CodeDiffConfig {
  diff: SerializableCodeDiff;
  controls?: {
    variant?: "inline" | "full";
    defaultViewMode?: "unified" | "split";
  };
}

export interface CodeDiffStreamingStage {
  snapshot: SerializableCodeDiff;
  isStreaming: boolean;
}

export type CodeDiffPresetName = "workspace-sync" | "receipt-state";

const workspaceSyncDiff: SerializableCodeDiff = {
  id: "workspace-sync",
  title: "Async workspace sync",
  description:
    "Adds optimistic syncing helpers and tightens error handling for the notification stream.",
  meta: {
    baseLabel: "main",
    headLabel: "feature/sync-enhancements",
    repository: "assistant-ui/tool-ui",
    baseCommit: "a1b2c3d",
    headCommit: "f9e8d7c",
    isComplete: true,
  },
  capturedAtISO: "2024-05-08T14:20:00Z",
  summary: {
    filesChanged: 2,
    insertions: 21,
    deletions: 9,
  },
  actions: [
    { id: "apply-all", label: "Apply all", tone: "primary" },
    { id: "open-github", label: "Open in GitHub", tone: "neutral" },
  ],
  emphasisFileIds: ["file-session-store"],
  files: [
    {
      id: "file-session-store",
      path: "lib/session/store.ts",
      status: "modified",
      language: "typescript",
      insertions: 12,
      deletions: 5,
      actions: [{ id: "apply-session-store", label: "Apply file", tone: "primary" }],
      hunks: [
        {
          id: "hunk-session-state",
          header: "@@ -18,12 +18,17 @@ export interface SessionStore",
          summary: "Adds optimistic flag and derived session getter",
          lines: [
            {
              id: "session-context-1",
              kind: "context",
              lineNumber: 18,
              content: "export interface SessionStore {",
            },
            {
              id: "session-remove-flag",
              kind: "remove",
              lineNumber: 20,
              content: "  isHydrated: boolean;",
            },
            {
              id: "session-add-flag",
              kind: "add",
              lineNumber: 20,
              content: "  isHydrated: boolean;",
            },
            {
              id: "session-add-optimistic",
              kind: "add",
              lineNumber: 21,
              content: "  isOptimistic?: boolean;",
              highlightRanges: [{ start: 2, length: 13, kind: "add" }],
              actions: [{ id: "comment-line", label: "Comment" }],
            },
            {
              id: "session-context-2",
              kind: "context",
              lineNumber: 24,
              content: "}",
            },
          ],
        },
        {
          id: "hunk-session-helper",
          header: "@@ -44,9 +49,15 @@ export function useSessionStore()",
          summary: "Provide derived session helper with optimistic fallback",
          lines: [
            {
              id: "session-context-3",
              kind: "context",
              lineNumber: 44,
              content: "  const [state, setState] = useState(initialState);",
            },
            {
              id: "session-remove-helper",
              kind: "remove",
              lineNumber: 47,
              content: "  const session = state.data;",
            },
            {
              id: "session-add-helper",
              kind: "add",
              lineNumber: 52,
              content: "  const session = state.data ?? state.optimisticData;",
              highlightRanges: [{ start: 31, length: 18, kind: "change" }],
            },
            {
              id: "session-add-return",
              kind: "add",
              lineNumber: 55,
              content: "  return { session, isHydrated: state.isHydrated };",
            },
          ],
          actions: [{ id: "focus-hunk", label: "Focus hunk", tone: "neutral" }],
        },
      ],
    },
    {
      id: "file-event-bridge",
      path: "lib/events/bridge.ts",
      status: "modified",
      language: "typescript",
      insertions: 9,
      deletions: 4,
      hunks: [
        {
          id: "hunk-event-error",
          header: "@@ -62,11 +62,16 @@ export async function pipeEvents()",
          summary: "Improves error message and adds retry metadata",
          lines: [
            {
              id: "event-context-1",
              kind: "context",
              lineNumber: 62,
              content: "    } catch (error) {",
            },
            {
              id: "event-remove-throw",
              kind: "remove",
              lineNumber: 64,
              content: "      throw new Error('Failed to push event');",
            },
            {
              id: "event-add-throw",
              kind: "add",
              lineNumber: 64,
              content:
                "      throw new Error(`Failed to push ${event.kind}: ${error}`);",
              highlightRanges: [{ start: 25, length: 29, kind: "change" }],
            },
            {
              id: "event-add-retry",
              kind: "add",
              lineNumber: 65,
              content: "    } finally {",
            },
            {
              id: "event-add-meta",
              kind: "add",
              lineNumber: 66,
              content: "      retry.backoff(event.id);",
            },
          ],
        },
      ],
    },
  ],
};

const receiptStateDiff: SerializableCodeDiff = {
  id: "receipt-state",
  title: "Applied changes: notification badge",
  description:
    "Read-only view after applying the diff. Actions are disabled and the banner summarizes the result.",
  meta: {
    baseLabel: "main",
    headLabel: "fix/badge-render",
    repository: "assistant-ui/tool-ui",
    isComplete: true,
  },
  capturedAtISO: "2024-05-07T09:12:00Z",
  summary: {
    filesChanged: 1,
    insertions: 8,
    deletions: 3,
  },
  receipt: {
    kind: "apply",
    status: "success",
    summary: "Applied cleanly to working tree",
    createdAtISO: "2024-05-07T09:13:45Z",
    fileIds: ["file-notification-badge"],
  },
  files: [
    {
      id: "file-notification-badge",
      path: "components/notification-badge.tsx",
      status: "modified",
      language: "tsx",
      insertions: 8,
      deletions: 3,
      hunks: [
        {
          id: "hunk-badge",
          header: "@@ -32,8 +32,13 @@ export function NotificationBadge()",
          summary: "Adds pause state and tone prop",
          lines: [
            {
              id: "badge-context",
              kind: "context",
              lineNumber: 32,
              content: "  const count = useUnreadCount();",
            },
            {
              id: "badge-remove-static",
              kind: "remove",
              lineNumber: 33,
              content: "  const tone = count > 0 ? 'primary' : 'muted';",
            },
            {
              id: "badge-add-tone",
              kind: "add",
              lineNumber: 34,
              content:
                "  const tone = paused ? 'warning' : count > 0 ? 'primary' : 'muted';",
              highlightRanges: [{ start: 13, length: 6, kind: "change" }],
            },
            {
              id: "badge-add-return",
              kind: "add",
              lineNumber: 38,
              content: "  return <Badge tone={tone} paused={paused} count={count} />;",
              actions: [{ id: "open-comment", label: "Comment" }],
            },
          ],
        },
      ],
    },
  ],
};

export const codeDiffPresets: Record<CodeDiffPresetName, CodeDiffConfig> = {
  "workspace-sync": {
    diff: workspaceSyncDiff,
    controls: {
      variant: "full",
      defaultViewMode: "unified",
    },
  },
  "receipt-state": {
    diff: receiptStateDiff,
    controls: {
      variant: "inline",
      defaultViewMode: "unified",
    },
  },
};

export const codeDiffPresetDescriptions: Record<CodeDiffPresetName, string> = {
  "workspace-sync": "Multi-file diff with actions and emphasis",
  "receipt-state": "Read-only receipt state after apply",
};

function cloneDiff(diff: SerializableCodeDiff): SerializableCodeDiff {
  return JSON.parse(JSON.stringify(diff));
}

export function buildStreamingStages(
  diff: SerializableCodeDiff,
): CodeDiffStreamingStage[] {
  const stages: CodeDiffStreamingStage[] = [];
  const working: SerializableCodeDiff = {
    ...diff,
    title: undefined,
    description: undefined,
    capturedAtISO: undefined,
    files: [],
    summary: undefined,
    actions: undefined,
    receipt: undefined,
    meta: diff.meta
      ? { ...diff.meta, isComplete: false }
      : { isComplete: false },
    emphasisFileIds: undefined,
  };
  const filesWorking: SerializableCodeDiffFile[] = [];
  working.files = filesWorking;

  const pushStage = (isStreaming: boolean) => {
    stages.push({
      snapshot: cloneDiff(working),
      isStreaming,
    });
  };

  // Stage 0: before streaming begins (idle)
  pushStage(false);
  // Stage 1: streaming initiated but no data yet
  pushStage(true);

  // Reveal metadata after initial pending state
  working.title = diff.title;
  working.description = diff.description;
  working.capturedAtISO = diff.capturedAtISO;
  working.actions = diff.actions;
  working.emphasisFileIds = diff.emphasisFileIds;
  if (diff.meta) {
    working.meta = { ...diff.meta, isComplete: false };
  }

  const finalFiles = diff.files ?? [];

  finalFiles.forEach((file) => {
    const fileWorking: SerializableCodeDiffFile = {
      ...file,
      hunks: [],
    };
    filesWorking.push(fileWorking);
    pushStage(true);

    const finalHunks = file.hunks ?? [];
    finalHunks.forEach((hunk) => {
      const hunkWorking: SerializableCodeDiffHunk = {
        ...hunk,
        lines: [],
      };
      fileWorking.hunks?.push(hunkWorking);
      pushStage(true);

      const finalLines = hunk.lines ?? [];
      finalLines.forEach((line) => {
        hunkWorking.lines?.push(line);
        pushStage(true);
      });
    });
  });

  if (diff.summary) {
    working.summary = diff.summary;
    pushStage(true);
  }

  if (diff.receipt) {
    working.receipt = diff.receipt;
    pushStage(true);
  }

  stages.push({
    snapshot: cloneDiff(diff),
    isStreaming: false,
  });

  return stages;
}
