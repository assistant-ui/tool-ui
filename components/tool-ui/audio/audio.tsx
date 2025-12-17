/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { cn } from "./_adapter";
import { ActionButtons, normalizeActionsConfig, type ActionsProp } from "../shared";
import { AudioProvider, useAudio } from "./context";
import type { SerializableAudio } from "./schema";

const FALLBACK_LOCALE = "en-US";

function AudioProgress() {
  return (
    <div className="flex w-full motion-safe:animate-pulse flex-col gap-3 p-3">
      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4">
        <div className="bg-muted size-14 w-full rounded" />
        <div className="flex flex-col gap-2 self-center">
          <div className="bg-muted h-4 w-3/4 rounded" />
          <div className="bg-muted h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="bg-muted h-10 w-full rounded" />
    </div>
  );
}

export interface AudioProps extends SerializableAudio {
  className?: string;
  isLoading?: boolean;
  onMediaEvent?: (type: "play" | "pause" | "mute" | "unmute") => void;
  responseActions?: ActionsProp;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}

export function Audio(props: AudioProps) {
  return (
    <AudioProvider>
      <AudioInner {...props} />
    </AudioProvider>
  );
}

function AudioInner(props: AudioProps) {
  const {
    className,
    isLoading,
    onMediaEvent,
    responseActions,
    onResponseAction,
    onBeforeResponseAction,
    ...serializable
  } = props;

  const {
    id,
    src,
    title,
    description,
    artwork,
    locale: providedLocale,
  } = serializable;

  const locale = providedLocale ?? FALLBACK_LOCALE;

  const { state, setState, setAudioElement } = useAudio();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    setAudioElement(audioRef.current);
    return () => setAudioElement(null);
  }, [setAudioElement]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.muted !== state.muted) {
      audio.muted = state.muted;
    }
  }, [state.muted]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.playing && audio.paused) {
      void audio.play().catch(() => undefined);
    } else if (!state.playing && !audio.paused) {
      audio.pause();
    }
  }, [state.playing]);

  const normalizedActions = React.useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  const showText = Boolean(title || description);
  const gridClasses = cn(
    "grid gap-4",
    artwork && showText
      ? "grid-cols-[112px_minmax(0,1fr)]"
      : artwork
        ? "grid-cols-[112px]"
        : "",
  );

  return (
    <article
      className={cn("relative w-full min-w-80 max-w-sm", className)}
      lang={locale}
      aria-busy={isLoading}
      data-tool-ui-id={id}
      data-slot="audio"
    >
      <div
        className={cn(
          "group @container relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl",
          "border border-border bg-card text-sm shadow-xs",
          "p-3",
          className,
        )}
      >
        {isLoading ? (
          <AudioProgress />
        ) : (
          <div className="flex w-full flex-col gap-3">
            <div className={gridClasses}>
              {artwork && (
                <div className="bg-muted relative size-14 w-full overflow-hidden">
                  <img
                    src={artwork}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )}
              {showText && (
                <div className="min-w-0 space-y-1 self-center">
                  {title && (
                    <div className="text-foreground line-clamp-2 font-semibold">
                      {title}
                    </div>
                  )}
                  {description && (
                    <div className="text-muted-foreground line-clamp-2">
                      {description}
                    </div>
                  )}
                </div>
              )}
            </div>
            <audio
              ref={audioRef}
              className="h-10 w-full"
              src={src}
              preload="metadata"
              controls
              onPlay={() => {
                setState({ playing: true });
                onMediaEvent?.("play");
              }}
              onPause={() => {
                setState({ playing: false });
                onMediaEvent?.("pause");
              }}
              onVolumeChange={(event) => {
                const target = event.currentTarget;
                setState({ muted: target.muted });
                onMediaEvent?.(target.muted ? "mute" : "unmute");
              }}
            />
          </div>
        )}
      </div>
      {normalizedActions && (
        <div className="@container/actions mt-3">
          <ActionButtons
            actions={normalizedActions.items}
            align={normalizedActions.align}
            confirmTimeout={normalizedActions.confirmTimeout}
            onAction={(actionId: string) => onResponseAction?.(actionId)}
            onBeforeAction={onBeforeResponseAction}
          />
        </div>
      )}
    </article>
  );
}
