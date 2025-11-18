"use client";

import { cn } from "./_cn";
import { useSocialPost } from "./context";
import { formatCount } from "./formatters";

export function Stats() {
  const { post, cfg, locale } = useSocialPost();
  const stats = post.stats ?? {};
  const items: Array<{ label: string; value?: number }> = [];

  if (stats.likes != null) items.push({ label: "Likes", value: stats.likes });
  if (stats.comments != null)
    items.push({ label: "Comments", value: stats.comments });
  if (stats.reposts != null)
    items.push({ label: "Reposts", value: stats.reposts });
  if (stats.shares != null)
    items.push({ label: "Shares", value: stats.shares });
  if (stats.bookmarks != null)
    items.push({ label: "Saves", value: stats.bookmarks });
  if (cfg.layout.showViews && stats.views != null)
    items.push({ label: "Views", value: stats.views });

  if (items.length === 0) return null;

  return (
    <div
      className={cn("mt-2 flex flex-wrap gap-4", cfg.tokens.typography.stats)}
    >
      {items.map(({ label, value }) => {
        const formatted = formatCount(value, locale);
        const narratable =
          formatted ??
          (typeof value === "number"
            ? new Intl.NumberFormat(locale).format(value)
            : "0");
        return (
          <div key={label} aria-label={`${narratable} ${label}`}>
            <span className="text-foreground font-medium">
              {formatted ?? narratable}
            </span>{" "}
            <span aria-hidden="true">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
