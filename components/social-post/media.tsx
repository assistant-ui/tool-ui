/* eslint-disable @next/next/no-img-element */
"use client";

import type { CSSProperties } from "react";
import { useSocialPost } from "./context";

function aspectToNumber(aspect?: string) {
  switch (aspect) {
    case "1:1":
      return 1;
    case "4:3":
      return 4 / 3;
    case "16:9":
      return 16 / 9;
    case "9:16":
      return 9 / 16;
    case "3:4":
      return 3 / 4;
    default:
      return undefined;
  }
}

export function Media() {
  const { post, cfg, handlers } = useSocialPost();
  const media = post.media ?? [];
  if (media.length === 0) return null;

  const strategy = cfg.layout.mediaStrategy;

  if (strategy === "verticalVideo" && media[0]?.kind === "video") {
    const item = media[0];
    const ar = aspectToNumber(item.aspectHint ?? cfg.layout.defaultAspect);
    return (
      <div
        className="relative mt-3 w-full overflow-hidden rounded-lg bg-black"
        style={ar ? ({ aspectRatio: String(ar) } as CSSProperties) : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <video
          src={item.url}
          poster={item.thumbUrl}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          onPlay={() => handlers.onMediaEvent?.("play")}
          onPause={() => handlers.onMediaEvent?.("pause")}
        />
      </div>
    );
  }

  if (strategy === "grid" && media.length > 1) {
    const ar = aspectToNumber(cfg.layout.defaultAspect);
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg @md:grid-cols-3">
        {media.slice(0, 9).map((item, index) => (
          <button
            key={index}
            type="button"
            className="bg-muted relative block w-full"
            style={
              ar ? ({ aspectRatio: String(ar) } as CSSProperties) : undefined
            }
            aria-label={item.alt || "Open media"}
            onClick={(event) => {
              event.stopPropagation();
              handlers.onMediaEvent?.("open", { index });
            }}
          >
            {item.kind === "image" ? (
              <img
                src={item.url}
                alt={item.alt ?? ""}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                src={item.url}
                poster={item.thumbUrl}
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
                onPlay={() => handlers.onMediaEvent?.("play")}
                onPause={() => handlers.onMediaEvent?.("pause")}
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  const item = media[0];
  const ar = aspectToNumber(item.aspectHint ?? cfg.layout.defaultAspect);
  return (
    <button
      type="button"
      className="bg-muted mt-3 w-full overflow-hidden rounded-lg"
      style={ar ? ({ aspectRatio: String(ar) } as CSSProperties) : undefined}
      aria-label={item.alt || "Open media"}
      onClick={(event) => {
        event.stopPropagation();
        handlers.onMediaEvent?.("open", { index: 0 });
      }}
    >
      {item.kind === "image" ? (
        <img
          src={item.url}
          alt={item.alt ?? ""}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          src={item.url}
          poster={item.thumbUrl}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          onPlay={() => handlers.onMediaEvent?.("play")}
          onPause={() => handlers.onMediaEvent?.("pause")}
        />
      )}
    </button>
  );
}
