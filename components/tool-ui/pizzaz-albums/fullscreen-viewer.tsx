/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { FilmStrip } from "./film-strip";
import type { Album } from "./types";

interface FullscreenViewerProps {
  album: Album;
  maxHeight?: number;
}

export function FullscreenViewer({ album, maxHeight }: FullscreenViewerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [album?.id]);

  const photo = album?.photos?.[index];

  return (
    <div
      className="relative h-full w-full bg-white"
      style={maxHeight ? { maxHeight } : undefined}
    >
      <div className="absolute inset-0 flex flex-row overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 hidden w-40 md:block">
          <FilmStrip album={album} selectedIndex={index} onSelect={setIndex} />
        </div>
        <div className="relative flex min-w-0 flex-1 items-center justify-center px-8 py-6 md:px-40 md:py-10">
          <div className="relative h-full w-full">
            {photo ? (
              <img
                src={photo.url}
                alt={photo.title || album.title}
                className="absolute inset-0 m-auto max-h-full max-w-full rounded-3xl border border-black/10 object-contain shadow-sm"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
