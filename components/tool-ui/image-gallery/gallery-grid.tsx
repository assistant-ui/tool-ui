"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { cn, ImageOff } from "./_adapter";
import { useImageGallery } from "./context";
import type { ImageGalleryItem } from "./schema";

type GridImage = Pick<
  ImageGalleryItem,
  "id" | "src" | "alt" | "width" | "height"
>;

const BORDER_RADIUS = 12;

const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

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
        const isOverflowTrigger = hiddenCount > 0 && index === overflowIndex;

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
  const { shouldSpanTwoRows } = computeImageLayout(image);

  const handleClick = useCallback(() => onClick(index), [onClick, index]);

  return (
    <div
      role="listitem"
      className={cn(
        "group relative cursor-pointer overflow-hidden",
        "bg-muted rounded-lg",
        shouldSpanTwoRows && "row-span-2",
      )}
      style={{ aspectRatio: shouldSpanTwoRows ? undefined : "1 / 1" }}
    >
      <button
        type="button"
        onClick={handleClick}
        className="absolute inset-0 z-20 h-full w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        aria-label={overlayCount ? `View ${overlayCount} more images` : image.alt}
      />

      {hasError ? (
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
          onError={() => setHasError(true)}
          style={{ borderRadius: BORDER_RADIUS }}
          className="relative h-full w-full object-cover !opacity-100"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 1 }}
          transition={SPRING_TRANSITION}
        />
      )}

      {overlayCount && <OverflowOverlay count={overlayCount} />}
    </div>
  );
}

function computeImageLayout(image: GridImage) {
  const aspectRatio = image.width / image.height;
  const isPortrait = aspectRatio < 1;
  const isSquarish = aspectRatio >= 0.9 && aspectRatio <= 1.1;

  return {
    shouldSpanTwoRows: isPortrait && !isSquarish,
  };
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
