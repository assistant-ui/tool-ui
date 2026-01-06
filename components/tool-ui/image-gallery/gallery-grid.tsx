 
"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { cn, ImageOff } from "./_adapter";
import { useImageGallery } from "./context";
import type { ImageGalleryItem } from "./schema";

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

type GridImage = Pick<ImageGalleryItem, "id" | "src" | "alt" | "width" | "height">;

interface GalleryGridProps {
  maxVisible?: number;
  onImageClick?: (imageId: string) => void;
}

export function GalleryGrid({ maxVisible, onImageClick }: GalleryGridProps) {
  const { images, openLightbox } = useImageGallery();

  const visibleImages = maxVisible ? images.slice(0, maxVisible) : images;
  const hiddenCount = maxVisible ? Math.max(0, images.length - maxVisible) : 0;
  const showOverflow = hiddenCount > 0;
  const overflowIndex = maxVisible ? maxVisible - 1 : -1;

  const handleImageClick = useCallback(
    (index: number) => {
      const image = images[index];
      if (image && onImageClick) {
        onImageClick(image.id);
      }
      openLightbox(index);
    },
    [images, onImageClick, openLightbox],
  );

  const handleOverflowClick = useCallback(() => {
    if (maxVisible) {
      openLightbox(maxVisible);
    }
  }, [maxVisible, openLightbox]);

  return (
    <div
      className="grid grid-cols-2 gap-2 @md:grid-cols-3 @lg:grid-cols-4"
      role="list"
    >
      {visibleImages.map((image, index) => {
        const isOverflowTrigger = showOverflow && index === overflowIndex;

        return (
          <GridImageCard
            key={image.id}
            image={image}
            index={index}
            onClick={isOverflowTrigger ? handleOverflowClick : handleImageClick}
            overlayCount={isOverflowTrigger ? hiddenCount + 1 : undefined}
          />
        );
      })}
    </div>
  );
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
  const [error, setError] = useState(false);

  const aspectRatio = image.width / image.height;
  const isPortrait = aspectRatio < 1;
  const isSquarish = aspectRatio >= 0.9 && aspectRatio <= 1.1;
  const spanTwoRows = isPortrait && !isSquarish;

  const handleError = useCallback(() => setError(true), []);
  const handleClick = useCallback(() => onClick(index), [onClick, index]);

  return (
    <div
      role="listitem"
      className={cn(
        "group relative cursor-pointer overflow-hidden",
        "bg-muted rounded-lg",
        spanTwoRows && "row-span-2",
      )}
      style={{ aspectRatio: spanTwoRows ? undefined : "1 / 1" }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="absolute inset-0 z-20 h-full w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        aria-label={overlayCount ? `View ${overlayCount} more images` : image.alt}
      />

      {error ? (
        <ImageErrorState alt={image.alt} />
      ) : (
        <motion.img
          layout
          layoutId={`gallery-image-${image.id}`}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          tabIndex={-1}
          loading="lazy"
          decoding="async"
          onError={handleError}
          style={{ borderRadius: 12 }}
          className="relative h-full w-full object-cover !opacity-100"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 1 }}
          transition={springTransition}
        />
      )}

      {overlayCount && <OverflowOverlay count={overlayCount} />}
    </div>
  );
}

function ImageErrorState({ alt }: { alt: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
      <ImageOff className="h-8 w-8 text-muted-foreground" />
      <span className="line-clamp-2 text-center text-xs text-muted-foreground">
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
