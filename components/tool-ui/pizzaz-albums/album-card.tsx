/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge, Button, cn } from "./_adapter";
import type { Album } from "./types";

interface AlbumCardProps {
  album: Album;
  onSelect?: (album: Album) => void;
}

export function AlbumCard({ album, onSelect }: AlbumCardProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      data-album-card
      className={cn(
        "group relative flex-shrink-0 w-[272px] bg-white text-left p-0 h-auto min-h-0 rounded-none shadow-none gap-0",
        "items-stretch justify-start hover:bg-white",
      )}
      onClick={() => onSelect?.(album)}
    >
      <div className="flex w-full flex-col gap-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
          <img
            src={album.cover}
            alt={album.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-white/60 text-black backdrop-blur-sm"
          >
            Featured
          </Badge>
        </div>
        <div className="px-1.5">
          <div className="text-base font-medium truncate">{album.title}</div>
          <div className="mt-0.5 text-sm font-normal text-black/60">
            {album.photos.length} photos
          </div>
        </div>
      </div>
    </Button>
  );
}
