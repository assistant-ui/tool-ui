"use client";

import * as React from "react";
import { cn } from "./_cn";
import { useMediaCard } from "./context";

interface LinkOverlayProps {
  className?: string;
  label?: string;
}

export function LinkOverlay({ className, label }: LinkOverlayProps) {
  const { card, resolvedHref, handlers } = useMediaCard();

  if (!resolvedHref) {
    return null;
  }

  const ariaLabel = label ?? card.title ?? card.description ?? card.domain ?? resolvedHref;

  return (
    <a
      className={cn("absolute inset-0 z-10", className)}
      href={resolvedHref}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={ariaLabel}
      onClick={(event) => {
        if (handlers.onNavigate) {
          event.preventDefault();
          handlers.onNavigate(resolvedHref, card);
        }
      }}
    />
  );
}
