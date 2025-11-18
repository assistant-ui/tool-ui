export function safeHref(href?: string) {
  if (!href) return undefined;
  try {
    const base =
      typeof window !== "undefined" && window.location
        ? window.location.origin
        : undefined;
    const url = base ? new URL(href, base) : new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {}
  return undefined;
}
