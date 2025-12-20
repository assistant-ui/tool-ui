import type { LucideIcon } from "lucide-react";
import {
  Wrench,
  Database,
  PanelTop,
  ExternalLink,
  MessageSquare,
  FileIcon,
  Activity,
} from "lucide-react";
import type { ConsoleEntryType } from "@/app/workbench/lib/types";

export const eventIcons: Record<ConsoleEntryType, LucideIcon> = {
  callTool: Wrench,
  setWidgetState: Database,
  requestDisplayMode: PanelTop,
  notifyIntrinsicHeight: PanelTop,
  requestModal: PanelTop,
  requestClose: ExternalLink,
  openExternal: ExternalLink,
  sendFollowUpMessage: MessageSquare,
  uploadFile: FileIcon,
  getFileDownloadUrl: FileIcon,
  event: Activity,
};

export const typeColors: Record<ConsoleEntryType, string> = {
  callTool: "text-blue-600 dark:text-blue-400",
  setWidgetState: "text-green-600 dark:text-green-400",
  requestDisplayMode: "text-purple-600 dark:text-purple-400",
  sendFollowUpMessage: "text-orange-600 dark:text-orange-400",
  requestClose: "text-neutral-500 dark:text-neutral-400",
  openExternal: "text-neutral-500 dark:text-neutral-400",
  notifyIntrinsicHeight: "text-teal-600 dark:text-teal-400",
  requestModal: "text-pink-600 dark:text-pink-400",
  uploadFile: "text-amber-600 dark:text-amber-400",
  getFileDownloadUrl: "text-amber-600 dark:text-amber-400",
  event: "text-cyan-600 dark:text-cyan-400",
};

export function formatRelativeTime(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatMethodName(method: string): string {
  const match = method.match(/^(\w+)\(/);
  return match ? match[1] : method;
}

export function extractToolName(method: string): string | null {
  const match = method.match(/callTool\("([^"]+)"\)/);
  return match ? match[1] : null;
}

export function isResponseEntry(_args: unknown, result: unknown): boolean {
  return result !== undefined;
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

export function extractKeyArg(args: unknown): string | null {
  if (!args || typeof args !== "object") return null;
  const obj = args as Record<string, unknown>;

  const keyOrder = [
    "query",
    "prompt",
    "message",
    "name",
    "title",
    "text",
    "input",
    "search",
    "q",
  ];

  for (const key of keyOrder) {
    if (typeof obj[key] === "string" && obj[key]) {
      return truncateString(obj[key] as string, 30);
    }
  }

  for (const value of Object.values(obj)) {
    if (typeof value === "string" && value) {
      return truncateString(value, 30);
    }
  }

  return null;
}

export function extractDisplayMode(method: string): string | null {
  const match = method.match(/requestDisplayMode\("([^"]+)"\)/);
  return match ? match[1] : null;
}

export function extractWidgetStatePreview(args: unknown): string | null {
  if (!args || typeof args !== "object") return null;
  const obj = args as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 0) return null;
  if (keys.length === 1) return keys[0];
  return `${keys.length} keys`;
}

export function extractPrompt(args: unknown): string | null {
  if (!args || typeof args !== "object") return null;
  const obj = args as Record<string, unknown>;
  if (typeof obj.prompt === "string") {
    return truncateString(obj.prompt, 30);
  }
  return null;
}

export function extractResultPreview(result: unknown): string {
  if (result === undefined || result === null) return "null";
  if (typeof result === "string") return truncateString(result, 40);
  if (typeof result === "number" || typeof result === "boolean")
    return String(result);
  if (Array.isArray(result)) return `[${result.length} items]`;
  if (typeof result === "object") {
    const obj = result as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => !k.startsWith("_"));
    if (keys.length === 0) return "{}";
    if (keys.length === 1) {
      const val = obj[keys[0]];
      if (typeof val === "string") return truncateString(val, 40);
      if (Array.isArray(val)) return `${keys[0]}: [${val.length}]`;
      return keys[0];
    }
    return `{${keys.slice(0, 2).join(", ")}${keys.length > 2 ? ", …" : ""}}`;
  }
  return String(result);
}
