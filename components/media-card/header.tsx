/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { Badge } from "./_ui";
import { useMediaCard } from "./context";

export function MediaCardHeader() {
  const { card, resolvedSourceUrl, handlers } = useMediaCard();
  const { source, domain } = card;

  if (!source && !domain) {
    return null;
  }

  const showDomain = domain && (!source || source.label !== domain);

  return (
    <div className="text-muted-foreground flex w-full items-start justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        {source?.iconUrl ? (
          <img
            src={source.iconUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="border-border/60 relative z-20 h-6 w-6 rounded-full border object-cover"
          />
        ) : domain ? (
          <div className="border-border/60 bg-muted relative z-20 flex h-6 w-6 items-center justify-center rounded-full border">
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
        ) : null}
        <div className="flex flex-col">
          {source?.label ? (
            <div className="text-foreground flex items-center gap-2 text-xs font-medium">
              <Badge
                variant="secondary"
                className="bg-muted text-foreground hover:bg-muted data-[state=open]:bg-muted"
              >
                {source.label}
              </Badge>
              {source.url ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const href = source.url;
                    if (!href) return;
                    if (handlers.onNavigate) {
                      handlers.onNavigate(href, card);
                    } else if (typeof window !== "undefined") {
                      window.open(href, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="underline-offset-2 hover:underline"
                >
                  Tool details
                </button>
              ) : null}
            </div>
          ) : null}
          {showDomain ? (
            <span className="text-muted-foreground">{domain}</span>
          ) : null}
        </div>
      </div>
      {resolvedSourceUrl ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (handlers.onNavigate) {
              handlers.onNavigate(resolvedSourceUrl, card);
            } else if (typeof window !== "undefined") {
              window.open(resolvedSourceUrl, "_blank", "noopener,noreferrer");
            }
          }}
          className="text-primary focus-visible:ring-ring relative z-20 text-[11px] font-medium underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          View source
        </button>
      ) : null}
    </div>
  );
}
