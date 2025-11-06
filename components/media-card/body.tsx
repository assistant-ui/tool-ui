"use client";

import * as React from "react";
import { cn } from "./_cn";
import { useMediaCard } from "./context";

export function MediaCardBody() {
  const { card } = useMediaCard();
  const title = card.title ?? card.og?.title;
  const description = card.description ?? card.og?.description;

  if (!title && !description) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-1">
      {title ? (
        <h3 className="text-foreground leading-snug font-medium @lg:text-base">
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
