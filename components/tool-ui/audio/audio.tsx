/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn, Button, Slider } from "./_adapter";
import { ActionButtons, normalizeActionsConfig, type ActionsProp } from "../shared";
import { AudioProvider, useAudio } from "./context";
import type { SerializableAudio } from "./schema";

const FALLBACK_LOCALE = "en-US";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function AudioProgress() {
  return (
    <div className="flex w-full flex-col gap-4 p-4 motion-safe:animate-pulse">
      <div className="flex items-center gap-4">
        <div className="bg-muted size-16 shrink-0 rounded-md" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="bg-muted h-4 w-3/4 rounded" />
          <div className="bg-muted h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-muted size-9 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="bg-muted h-1.5 w-full rounded-full" />
          <div className="flex justify-between">
            <div className="bg-muted h-3 w-8 rounded" />
            <div className="bg-muted h-3 w-8 rounded" />
          </div>
        </div>
        <div className="bg-muted size-8 shrink-0 rounded-full" />
      </div>
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
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isSeeking, setIsSeeking] = React.useState(false);

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

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  };

  const handleMuteToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

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
        )}
      >
        {isLoading ? (
          <AudioProgress />
        ) : (
          <div className="flex w-full flex-col gap-4 p-4">
            <div className="flex items-center gap-4">
              {artwork && (
                <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md shadow-sm">
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
              <div className="min-w-0 flex-1 space-y-0.5">
                {title && (
                  <div className="text-foreground line-clamp-2 text-[15px] leading-tight font-semibold">
                    {title}
                  </div>
                )}
                {description && (
                  <div className="text-muted-foreground line-clamp-2 text-sm">
                    {description}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="icon"
                onClick={handlePlayPause}
                className="size-9 shrink-0 rounded-full"
                aria-label={state.playing ? "Pause" : "Play"}
              >
                {state.playing ? (
                  <Pause className="size-4" fill="currentColor" />
                ) : (
                  <Play className="size-4 ml-0.5" fill="currentColor" />
                )}
              </Button>
              <div className="flex flex-1 flex-col gap-1">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  onPointerDown={handleSeekStart}
                  onPointerUp={handleSeekEnd}
                  className="cursor-pointer [&_[data-slot=thumb]]:bg-primary [&_[data-slot=thumb]]:border-primary"
                  aria-label="Audio progress"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMuteToggle}
                className="size-8 shrink-0"
                aria-label={state.muted ? "Unmute" : "Mute"}
              >
                {state.muted ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </Button>
            </div>

            <audio
              ref={audioRef}
              src={src}
              preload="metadata"
              className="hidden"
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
              onTimeUpdate={(event) => {
                if (!isSeeking) {
                  setCurrentTime(event.currentTarget.currentTime);
                }
              }}
              onLoadedMetadata={(event) => {
                setDuration(event.currentTarget.duration);
              }}
              onDurationChange={(event) => {
                setDuration(event.currentTarget.duration);
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
