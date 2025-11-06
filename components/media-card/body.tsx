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
        <h3 className="text-sm font-medium leading-snug text-foreground @lg:text-base">
          <span className={cn("line-clamp-2")}>{title}</span>
        </h3>
      ) : null}
      {description ? (
        <p className="text-xs leading-snug text-muted-foreground @lg:text-sm">
          <span className="line-clamp-2">{description}</span>
        </p>
      ) : null}
    </div>
  );
}
