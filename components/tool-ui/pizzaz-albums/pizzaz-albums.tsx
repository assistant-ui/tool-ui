"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AlbumCard } from "./album-card";
import { FullscreenViewer } from "./fullscreen-viewer";
import { Button, cn } from "./_adapter";
import { DEFAULT_ALBUMS } from "./data";
import type { Album, PizzazAlbumsProps } from "./types";

const SCROLL_EDGE_THRESHOLD_PX = 8;

function getScrollStep(
  listEl: HTMLDivElement | null,
  containerEl: HTMLDivElement | null,
): number {
  if (!listEl || !containerEl || typeof window === "undefined") {
    return containerEl?.clientWidth ?? 0;
  }

  const firstCard = listEl.querySelector<HTMLElement>("[data-album-card]");
  if (!firstCard) return containerEl.clientWidth;

  const styles = window.getComputedStyle(listEl);
  const gapValue = styles.columnGap || styles.gap || "0px";
  const gap = Number.parseFloat(gapValue) || 0;

  return firstCard.offsetWidth + gap;
}

interface AlbumsCarouselProps {
  albums: Album[];
  onSelect: (album: Album) => void;
}

function AlbumsCarousel({ albums, onSelect }: AlbumsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollLeft = Math.round(container.scrollLeft);
    const maxScroll = Math.max(
      0,
      Math.round(container.scrollWidth - container.clientWidth),
    );

    setCanPrev(scrollLeft > SCROLL_EDGE_THRESHOLD_PX);
    setCanNext(scrollLeft < maxScroll - SCROLL_EDGE_THRESHOLD_PX);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateButtons();

    const handleScroll = () => updateButtons();
    container.addEventListener("scroll", handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(updateButtons);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [updateButtons, albums.length]);

  const handleScrollBy = useCallback(
    (direction: "prev" | "next") => {
      const container = scrollRef.current;
      if (!container) return;

      const step =
        getScrollStep(listRef.current, container) ||
        Math.max(240, container.clientWidth * 0.8);

      container.scrollBy({
        left: direction === "prev" ? -step : step,
        behavior: "smooth",
      });
    },
    [],
  );

  return (
    <div className="relative w-full select-none py-5 text-black">
      <div
        ref={scrollRef}
        className="scrollbar-subtle snap-x snap-mandatory overflow-x-auto scroll-smooth max-sm:mx-5"
      >
        <div ref={listRef} className="flex items-stretch gap-5">
          {albums.map((album) => (
            <div key={album.id} className="snap-start">
              <AlbumCard album={album} onSelect={onSelect} />
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-[5] w-3 transition-opacity duration-200",
          canPrev ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className="h-full w-full border-l border-black/15 bg-gradient-to-r from-black/10 to-transparent"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
          }}
        />
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-[5] w-3 transition-opacity duration-200",
          canNext ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className="h-full w-full border-r border-black/15 bg-gradient-to-l from-black/10 to-transparent"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
          }}
        />
      </div>

      {canPrev && (
        <Button
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 border-none bg-white/80 text-black shadow-lg hover:bg-white"
          size="icon-sm"
          type="button"
          variant="secondary"
          onClick={() => handleScrollBy("prev")}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Button>
      )}
      {canNext && (
        <Button
          aria-label="Next"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 border-none bg-white/80 text-black shadow-lg hover:bg-white"
          size="icon-sm"
          type="button"
          variant="secondary"
          onClick={() => handleScrollBy("next")}
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

export function PizzazAlbums({
  albums: albumsProp,
  displayMode = "inline",
  maxHeight,
  className,
  onRequestDisplayMode,
}: PizzazAlbumsProps) {
  const albums = useMemo(
    () => (Array.isArray(albumsProp) ? albumsProp : DEFAULT_ALBUMS),
    [albumsProp],
  );
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAlbumId) return;
    if (!albums.some((album) => album.id === selectedAlbumId)) {
      setSelectedAlbumId(albums[0]?.id ?? null);
    }
  }, [albums, selectedAlbumId]);

  const selectedAlbum = useMemo(
    () => albums.find((album) => album.id === selectedAlbumId) ?? null,
    [albums, selectedAlbumId],
  );
  const activeAlbum = selectedAlbum ?? albums[0] ?? null;

  const handleSelectAlbum = useCallback(
    (album: Album) => {
      setSelectedAlbumId(album.id);
      void onRequestDisplayMode?.("fullscreen");
    },
    [onRequestDisplayMode],
  );

  const containerStyle = useMemo<CSSProperties | undefined>(() => {
    if (displayMode === "fullscreen") {
      return { height: "100%" };
    }
    if (maxHeight) {
      return { height: maxHeight, maxHeight };
    }
    return undefined;
  }, [displayMode, maxHeight]);

  return (
    <div
      className={cn("relative w-full bg-white text-black antialiased", className)}
      style={containerStyle}
    >
      {albums.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-black/60">
          No albums available.
        </div>
      ) : displayMode === "fullscreen" && activeAlbum ? (
        <FullscreenViewer album={activeAlbum} />
      ) : (
        <AlbumsCarousel albums={albums} onSelect={handleSelectAlbum} />
      )}
    </div>
  );
}
