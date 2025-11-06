"use client";

export function formatCount(n?: number, locale = "en-US") {
  if (n == null) return undefined;
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatRelativeTime(iso?: string, locale = "en-US") {
  if (!iso) return undefined;
  const dateMs = new Date(iso).getTime();
  if (Number.isNaN(dateMs)) return undefined;
  const now = Date.now();
  const diffSeconds = Math.round((now - dateMs) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const table: Array<{ limit: number; divisor: number; unit: string }> = [
    { limit: 60, divisor: 1, unit: "s" },
    { limit: 3600, divisor: 60, unit: "m" },
    { limit: 86400, divisor: 3600, unit: "h" },
    { limit: 604800, divisor: 86400, unit: "d" },
    { limit: 2629800, divisor: 604800, unit: "w" },
    { limit: 31557600, divisor: 2629800, unit: "mo" },
  ];

  for (const entry of table) {
    if (absSeconds < entry.limit) {
      const value = Math.round(absSeconds / entry.divisor);
      return `${value}${entry.unit}`;
    }
  }

  const years = Math.round(absSeconds / 31557600);
  return `${years}y`;
}

export type TextPart = { type: "text" | "url" | "mention" | "hashtag"; value: string };
const urlRe = /\bhttps?:\/\/[^\s]+/gi;
const mentionRe = /(^|[\s])@([a-zA-Z0-9_.]+)/g;
const hashRe = /(^|[\s])#([a-zA-Z0-9_]+)/g;

export function splitText(text?: string): TextPart[] {
  if (!text) return [];

  const withUrls: TextPart[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(urlRe)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      withUrls.push({ type: "text", value: text.slice(lastIndex, start) });
    }
    withUrls.push({ type: "url", value: match[0] });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length || withUrls.length === 0) {
    withUrls.push({ type: "text", value: text.slice(lastIndex) });
  }

  const out: TextPart[] = [];
  for (const part of withUrls) {
    if (part.type !== "text") {
      out.push(part);
      continue;
    }

    let segment = part.value;
    segment = segment.replace(mentionRe, (full, ws, handle) => `${ws}\u0001${handle}\u0001`);
    segment = segment.replace(hashRe, (full, ws, topic) => `${ws}\u0002${topic}\u0002`);

    const tokens = segment.split(/(\u0001|\u0002)/);
    let mode: "mention" | "hashtag" | null = null;
    for (const token of tokens) {
      if (!token) continue;
      if (token === "\u0001") {
        mode = mode ? null : "mention";
        continue;
      }
      if (token === "\u0002") {
        mode = mode ? null : "hashtag";
        continue;
      }
      out.push(mode ? { type: mode, value: token } : { type: "text", value: token });
    }
  }

  return out;
}
