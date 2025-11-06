"use client";

import * as React from "react";
import { cn } from "./_cn";
import { useMediaCard } from "./context";

export function MediaCardBody() {
  const { card, resolvedSourceUrl, handlers } = useMediaCard();
  const title = card.title ?? card.og?.title;
  const description = card.description ?? card.og?.description;
  const isLinkCard = card.kind === "link";

  if (!title && !description) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-1">
      {isLinkCard && resolvedSourceUrl && card.domain ? (
        <a
          href={resolvedSourceUrl}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (handlers.onNavigate) {
              handlers.onNavigate(resolvedSourceUrl, card);
            } else if (typeof window !== "undefined") {
              window.open(resolvedSourceUrl, "_blank", "noopener,noreferrer");
            }
          }}
          className="text-muted-foreground focus-visible:ring-ring relative z-20 w-fit text-xs underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {card.domain}
        </a>
      ) : null}
      {title ? (
        <h3 className="text-foreground text-base font-medium">
          <span className={cn("line-clamp-2")}>{title}</span>
        </h3>
      ) : null}
      {description ? (
        <p className="text-muted-foreground leading-snug">
          <span className="line-clamp-2">{description}</span>
        </p>
      ) : null}
    </div>
  );
}
