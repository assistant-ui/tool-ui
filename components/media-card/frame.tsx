/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { cn } from "./_cn";
import type { Aspect } from "./schema";
import { useMediaCard } from "./context";
import { Button } from "./_ui";
import { Play } from "lucide-react";

const RATIO_CLASS_MAP: Record<Aspect, string> = {
  auto: "",
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
};

export function MediaFrame() {
  const {
    card,
    setMediaElement,
    state,
    setState,
    handlers,
    resolvedSourceUrl,
  } = useMediaCard();

  const ref = React.useRef<HTMLMediaElement | null>(null);

  const ratio =
    card.ratio ??
    (card.kind === "video" || card.kind === "link" ? "16:9" : "auto");
  const fit = card.fit ?? "cover";
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";

  React.useEffect(() => {
    if (card.kind === "video" || card.kind === "audio") {
      setMediaElement(ref.current);
      return () => setMediaElement(null);
    }
    return;
  }, [card.kind, setMediaElement]);

  React.useEffect(() => {
    if (!ref.current) return;
    if (state.muted === undefined) return;
    ref.current.muted = state.muted;
  }, [state.muted]);

  React.useEffect(() => {
    if (!ref.current) return;
    if (state.playing === undefined) return;
    if (state.playing && ref.current.paused) {
      void ref.current.play().catch(() => undefined);
    }
    if (!state.playing && !ref.current.paused) {
      ref.current.pause();
    }
  }, [state.playing]);

  if (card.kind === "image") {
    if (!card.src) return null;
    const sourceLabel = card.source?.label ?? card.domain;
    const sourceUrl =
      resolvedSourceUrl ?? card.source?.url ?? card.href ?? card.src;
    const fallbackInitial = (sourceLabel ?? "").trim().charAt(0).toUpperCase();
    const hasSource = Boolean(sourceLabel || card.source?.iconUrl);
    const handleSourceClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!sourceUrl) return;
      if (handlers.onNavigate) {
        handlers.onNavigate(sourceUrl, card);
      } else if (typeof window !== "undefined") {
        window.open(sourceUrl, "_blank", "noopener,noreferrer");
      }
    };
    const SourceContent = hasSource ? (
      <div className="flex items-center gap-2">
        {card.source?.iconUrl ? (
          <img
            src={card.source.iconUrl}
            alt=""
            aria-hidden="true"
            className="h-7 w-7 rounded-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : fallbackInitial ? (
          <div className="bg-background/70 text-foreground flex h-7 w-7 items-center justify-center rounded-full font-semibold uppercase">
            {fallbackInitial}
          </div>
        ) : null}
        {sourceLabel ? (
          <span className="text-foreground font-medium">{sourceLabel}</span>
        ) : null}
      </div>
    ) : null;

    return (
      <div
        className={cn(
          "bg-muted relative w-full overflow-hidden rounded-lg",
          ratio !== "auto" ? RATIO_CLASS_MAP[ratio] : "min-h-[160px]",
        )}
      >
        <img
          src={card.src}
          alt={card.alt ?? ""}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full",
            fitClass,
            "transition-transform duration-300 group-hover:scale-[1.01]",
          )}
        />
        {SourceContent ? (
          sourceUrl ? (
            <button
              type="button"
              onClick={handleSourceClick}
              className="border-border/60 bg-background/80 text-foreground focus-visible:ring-ring absolute bottom-4 left-4 z-30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-left text-xs shadow-sm backdrop-blur focus-visible:ring-2 focus-visible:outline-none"
            >
              {SourceContent}
            </button>
          ) : (
            <div className="border-border/60 bg-background/80 text-foreground absolute bottom-4 left-4 z-30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur">
              {SourceContent}
            </div>
          )
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
    );
  }

  if (card.kind === "video") {
    if (!card.src) return null;
    const poster = card.thumb ?? card.og?.imageUrl;
    const title = card.title ?? card.og?.title;
    const handleWatch = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const node = ref.current;
      if (!node) return;
      if (node.paused) {
        void node.play().catch(() => undefined);
      } else {
        node.pause();
      }
    };
    const isMuted = state.muted ?? true;
    return (
      <div
        className={cn(
          "group relative w-full overflow-hidden rounded-lg bg-black",
          ratio !== "auto" ? RATIO_CLASS_MAP[ratio] : "aspect-video",
        )}
      >
        <video
          ref={ref as React.RefObject<HTMLVideoElement>}
          className={cn(
            "relative z-10 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]",
            ratio !== "auto" ? "absolute inset-0 h-full w-full" : "",
          )}
          src={card.src}
          poster={poster}
          controls
          playsInline
          autoPlay
          preload="metadata"
          muted={isMuted}
          onPlay={() => {
            setState({ playing: true });
            handlers.onMediaEvent?.("play");
          }}
          onPause={() => {
            setState({ playing: false });
            handlers.onMediaEvent?.("pause");
          }}
          onVolumeChange={(event) => {
            const target = event.currentTarget;
            setState({ muted: target.muted });
            handlers.onMediaEvent?.(target.muted ? "mute" : "unmute");
          }}
        />
        {title ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-5 pt-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="line-clamp-2 max-w-[70%] font-semibold text-white drop-shadow-sm">
                {title}
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleWatch}
                className="shadow-sm"
              >
                <Play className="mr-1 h-4 w-4" aria-hidden="true" />
                Watch
              </Button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  if (card.kind === "audio") {
    if (!card.src) return null;
    const thumb = card.thumb ?? card.og?.imageUrl;
    const showText = Boolean(card.title || card.description);
    const gridClasses = cn(
      "grid gap-4",
      thumb && showText
        ? "grid-cols-[112px_minmax(0,1fr)]"
        : thumb
          ? "grid-cols-[112px]"
          : "",
    );

    return (
      <div className="w-full space-y-3">
        <div className={gridClasses}>
          {thumb ? (
            <div className="bg-muted relative h-24 w-full overflow-hidden rounded-md">
              <img
                src={thumb}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : null}
          {showText ? (
            <div className="min-w-0 space-y-1 self-center">
              {card.title ? (
                <div className="text-foreground line-clamp-2 font-semibold">
                  {card.title}
                </div>
              ) : null}
              {card.description ? (
                <div className="text-muted-foreground line-clamp-2">
                  {card.description}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <audio
          ref={ref as React.RefObject<HTMLAudioElement>}
          className="w-full"
          src={card.src}
          preload="metadata"
          controls
          onPlay={() => {
            setState({ playing: true });
            handlers.onMediaEvent?.("play");
          }}
          onPause={() => {
            setState({ playing: false });
            handlers.onMediaEvent?.("pause");
          }}
          onVolumeChange={(event) => {
            const target = event.currentTarget;
            setState({ muted: target.muted });
            handlers.onMediaEvent?.(target.muted ? "mute" : "unmute");
          }}
        />
      </div>
    );
  }

  if (card.kind === "link") {
    const thumb = card.thumb ?? card.og?.imageUrl;
    if (!thumb) {
      return null;
    }
    return (
      <div
        className={cn(
          "bg-muted relative w-full overflow-hidden rounded-lg",
          ratio !== "auto" ? RATIO_CLASS_MAP[ratio] : "aspect-[5/3]",
        )}
      >
        <img
          src={thumb}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full",
            fitClass,
            "object-center transition-transform duration-300 group-hover:scale-[1.01]",
          )}
        />
      </div>
    );
  }

  return null;
}
