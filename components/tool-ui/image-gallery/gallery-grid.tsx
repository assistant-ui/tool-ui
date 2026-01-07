"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn, ImageOff } from "./_adapter";
import { useImageGallery } from "./context";
import type { ImageGalleryItem } from "./schema";

type GridImage = Pick<
  ImageGalleryItem,
  "id" | "src" | "alt" | "width" | "height"
>;

interface GalleryGridProps {
  maxVisible?: number;
  onImageClick?: (imageId: string) => void;
}

export function GalleryGrid({ maxVisible, onImageClick }: GalleryGridProps) {
  const { images, openLightbox } = useImageGallery();

  const { visibleImages, hiddenCount, overflowIndex } = computeVisibility(
    images,
    maxVisible,
  );

  const handleOpen = useCallback(
    (index: number) => {
      const image = images[index];
      if (image && onImageClick) {
        onImageClick(image.id);
      }
      openLightbox(index);
    },
    [images, onImageClick, openLightbox],
  );

  return (
    <div
      className="grid grid-cols-2 gap-2 @md:grid-cols-3 @lg:grid-cols-4"
      role="list"
    >
      {visibleImages.map((image, index) => {
        const isOverflowTrigger = hiddenCount > 0 && index === overflowIndex;

        return (
          <GridImageCard
            key={image.id}
            image={image}
            index={index}
            onClick={handleOpen}
            overlayCount={isOverflowTrigger ? hiddenCount + 1 : undefined}
          />
        );
      })}
    </div>
  );
}

function computeVisibility(images: GridImage[], maxVisible?: number) {
  if (!maxVisible) {
    return {
      visibleImages: images,
      hiddenCount: 0,
      overflowIndex: -1,
    };
  }

  return {
    visibleImages: images.slice(0, maxVisible),
    hiddenCount: Math.max(0, images.length - maxVisible),
    overflowIndex: maxVisible - 1,
  };
}

interface GridImageCardProps {
  image: GridImage;
  index: number;
  onClick: (index: number) => void;
  overlayCount?: number;
}

function GridImageCard({
  image,
  index,
  onClick,
  overlayCount,
}: GridImageCardProps) {
  const [hasError, setHasError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { registerImage } = useImageGallery();

  const shouldSpanTwoRows = isPortraitImage(image);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const img = wrapper?.querySelector("img");
    if (img) {
      registerImage(image.id, img);
    }
    return () => {
      registerImage(image.id, null);
    };
  }, [image.id, registerImage]);

  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  return (
    <div
      role="listitem"
      className={cn(
        "group relative cursor-pointer",
        shouldSpanTwoRows && "row-span-2",
      )}
      style={{ aspectRatio: shouldSpanTwoRows ? undefined : "1 / 1" }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="absolute inset-0 z-20 h-full w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={
          overlayCount ? `View ${overlayCount} more images` : image.alt
        }
      />

      <div
        ref={wrapperRef}
        className="bg-muted relative h-full w-full overflow-hidden rounded-lg transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02] group-active:scale-[0.98]"
      >
        {hasError ? (
          <ImageErrorState alt={image.alt} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {overlayCount && <OverflowOverlay count={overlayCount} />}
    </div>
  );
}

function isPortraitImage(image: GridImage): boolean {
  const aspectRatio = image.width / image.height;
  const isPortrait = aspectRatio < 1;
  const isSquarish = aspectRatio >= 0.9 && aspectRatio <= 1.1;
  return isPortrait && !isSquarish;
}

function ImageErrorState({ alt }: { alt: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
      <ImageOff className="text-muted-foreground h-8 w-8" />
      <span className="text-muted-foreground line-clamp-2 text-center text-xs">
        {alt}
      </span>
    </div>
  );
}

function OverflowOverlay({ count }: { count: number }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-black/60">
      <span className="text-2xl font-semibold text-white">+{count}</span>
    </div>
  );
}
