"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { cn, Button } from "./_adapter";
import { ActionButtons, normalizeActionsConfig, type ActionsProp } from "../shared";
import {
  RATIO_CLASS_MAP,
  OVERLAY_GRADIENT,
} from "../shared/media";
import { VideoProvider, useVideo } from "./context";
import type { SerializableVideo } from "./schema";

const FALLBACK_LOCALE = "en-US";

function VideoProgressSkeleton() {
  return (
    <div className="flex w-full motion-safe:animate-pulse flex-col gap-3">
      <div className="bg-muted aspect-video w-full rounded-lg" />
    </div>
  );
}

export interface VideoProps extends SerializableVideo {
  className?: string;
  autoPlay?: boolean;
  defaultMuted?: boolean;
  onNavigate?: (href: string, video: SerializableVideo) => void;
  onMediaEvent?: (type: "play" | "pause" | "mute" | "unmute") => void;
  responseActions?: ActionsProp;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}

function VideoRoot(props: VideoProps) {
  const {
    defaultMuted = true,
    ...rest
  } = props;

  return (
    <VideoProvider defaultState={{ muted: defaultMuted }}>
      <VideoInner {...rest} />
    </VideoProvider>
  );
}

function VideoInner(props: Omit<VideoProps, "defaultMuted">) {
  const {
    className,
    autoPlay = true,
    onNavigate,
    onMediaEvent,
    responseActions,
    onResponseAction,
    onBeforeResponseAction,
    ...serializable
  } = props;

  const {
    id,
    src,
    poster,
    title,
    ratio = "16:9",
    locale: providedLocale,
  } = serializable;

  const locale = providedLocale ?? FALLBACK_LOCALE;

  const { state, setState, setVideoElement } = useVideo();
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    setVideoElement(videoRef.current);
    return () => setVideoElement(null);
  }, [setVideoElement]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted !== state.muted) {
      video.muted = state.muted;
    }
  }, [state.muted]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (state.playing && video.paused) {
      void video.play().catch(() => undefined);
    } else if (!state.playing && !video.paused) {
      video.pause();
    }
  }, [state.playing]);

  const normalizedActions = React.useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  const handleWatch = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  };

  return (
    <article
      className={cn("relative w-full min-w-80 max-w-md", className)}
      lang={locale}
      data-tool-ui-id={id}
      data-slot="video"
    >
      <div
        className={cn(
          "group @container relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl",
          "border border-border bg-card text-sm shadow-xs",
        )}
      >
        <div
          className={cn(
            "group relative w-full overflow-hidden bg-black",
            ratio !== "auto" ? RATIO_CLASS_MAP[ratio] : "aspect-video",
          )}
        >
          <video
            ref={videoRef}
            className={cn(
              "relative z-10 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]",
              ratio !== "auto" && "absolute inset-0 h-full w-full",
            )}
            src={src}
            poster={poster}
            controls
            playsInline
            autoPlay={autoPlay}
            preload="metadata"
            muted={state.muted}
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
          {title && (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ backgroundImage: OVERLAY_GRADIENT }}
              />
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
          )}
        </div>
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

type VideoProgressProps = {
  id?: SerializableVideo["id"];
  className?: string;
  locale?: string;
};

function VideoProgressVariant({
  id,
  className,
  locale,
}: VideoProgressProps) {
  const resolvedLocale = locale ?? FALLBACK_LOCALE;

  return (
    <article
      className={cn("relative w-full min-w-80 max-w-md", className)}
      lang={resolvedLocale}
      aria-busy="true"
      data-tool-ui-id={id}
      data-slot="video"
    >
      <div
        className={cn(
          "group @container relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl",
          "border border-border bg-card text-sm shadow-xs",
        )}
      >
        <VideoProgressSkeleton />
      </div>
    </article>
  );
}

type VideoComponent = {
  (props: VideoProps): React.ReactElement;
  Progress: typeof VideoProgressVariant;
};

export const Video = Object.assign(VideoRoot, {
  Progress: VideoProgressVariant,
}) as VideoComponent;
