export type ThreadMeta = {
  instanceSlug: string;
  configVersion: string;
  deploymentId?: string;
  forkedFrom?: string;
  commitSha?: string;
  createdAt: string;
  tags?: string[];
};

type ThreadMetaStore = Record<string, ThreadMeta>;

export type ThreadSnapshot = {
  messages: unknown;
  updatedAt: string;
};

type ThreadHistoryStore = Record<string, ThreadSnapshot>;

const STORAGE_KEY = "assistant:thread-meta";
const HISTORY_KEY = "assistant:thread-history";
const PENDING_REPLAY_KEY = "assistant:pending-replay";

let cache: ThreadMetaStore | null = null;
const subscribers = new Set<() => void>();
let historyCache: ThreadHistoryStore | null = null;
const historySubscribers = new Set<() => void>();

type PendingReplayPayload = {
  threadId: string;
  sourceSlug: string;
  requestedAt: string;
};

const safeParse = (value: string | null): ThreadMetaStore => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as ThreadMetaStore;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
};

const readFromStorage = (): ThreadMetaStore => {
  if (typeof window === "undefined") {
    return cache ?? {};
  }

  if (cache) return cache;
  cache = safeParse(window.localStorage.getItem(STORAGE_KEY));
  return cache;
};

const writeToStorage = (next: ThreadMetaStore) => {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  subscribers.forEach((callback) => callback());
};

const safeParseHistory = (value: string | null): ThreadHistoryStore => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as ThreadHistoryStore;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
};

const readHistoryFromStorage = (): ThreadHistoryStore => {
  if (typeof window === "undefined") {
    return historyCache ?? {};
  }
  if (historyCache) return historyCache;
  historyCache = safeParseHistory(window.localStorage.getItem(HISTORY_KEY));
  return historyCache;
};

const writeHistoryToStorage = (next: ThreadHistoryStore) => {
  historyCache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }
  historySubscribers.forEach((callback) => callback());
};

export const getThreadMetaStore = (): ThreadMetaStore => {
  return readFromStorage();
};

export const subscribeThreadMetaStore = (callback: () => void) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

export const setThreadMeta = (threadId: string, meta: ThreadMeta) => {
  const store = { ...readFromStorage(), [threadId]: meta };
  writeToStorage(store);
};

export const ensureThreadMeta = (
  threadId: string,
  metaFactory: () => ThreadMeta,
) => {
  const store = readFromStorage();
  if (!store[threadId]) {
    writeToStorage({ ...store, [threadId]: metaFactory() });
  }
};

export const getThreadMeta = (threadId: string): ThreadMeta | undefined => {
  return readFromStorage()[threadId];
};

export const getThreadIdsForInstance = (instanceSlug: string): string[] => {
  return Object.entries(readFromStorage())
    .filter(([, meta]) => meta.instanceSlug === instanceSlug)
    .map(([threadId]) => threadId);
};

export const subscribeThreadHistoryStore = (callback: () => void) => {
  historySubscribers.add(callback);
  return () => {
    historySubscribers.delete(callback);
  };
};

export const getThreadHistoryStore = (): ThreadHistoryStore => {
  return readHistoryFromStorage();
};

export const setThreadSnapshot = (
  threadId: string,
  snapshot: ThreadSnapshot,
) => {
  const history = readHistoryFromStorage();
  writeHistoryToStorage({ ...history, [threadId]: snapshot });
};

export const getThreadSnapshot = (
  threadId: string,
): ThreadSnapshot | undefined => {
  return readHistoryFromStorage()[threadId];
};

export const setPendingReplay = (payload: PendingReplayPayload) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_REPLAY_KEY, JSON.stringify(payload));
};

export const consumePendingReplay = (): PendingReplayPayload | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PENDING_REPLAY_KEY);
  if (!raw) return null;
  window.localStorage.removeItem(PENDING_REPLAY_KEY);
  try {
    return JSON.parse(raw) as PendingReplayPayload;
  } catch {
    return null;
  }
};



