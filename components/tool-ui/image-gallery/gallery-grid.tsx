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
    (index: number, coverScale: number) => {
      const image = images[index];
      if (image && onImageClick) {
        onImageClick(image.id);
      }
      openLightbox(index, coverScale);
    },
    [images, onImageClick, openLightbox],
  );

  const handleOverflowClick = useCallback(
    (coverScale: number) => {
      if (maxVisible) {
        openLightbox(maxVisible, coverScale);
      }
    },
    [maxVisible, openLightbox],
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
  onClick: (index: number, coverScale: number) => void;
  overlayCount?: number;
}

function GridImageCard({
  image,
  index,
  onClick,
  overlayCount,
}: GridImageCardProps) {
  const [hasError, setHasError] = useState(false);
  const { images, activeIndex } = useImageGallery();
  const { shouldSpanTwoRows, coverScale } = computeImageLayout(image);

  const imageIndex = images.findIndex((img) => img.id === image.id);
  // Hide only while OPEN. During close we need a visible target to animate back to.
  const isActive = imageIndex === activeIndex;

  const handleClick = useCallback(() => onClick(index, coverScale), [onClick, index, coverScale]);

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
        <motion.div
          layoutId={`gallery-image-${image.id}`}
          transition={SPRING_TRANSITION}
          style={{ borderRadius: BORDER_RADIUS, opacity: isActive ? 0 : 1 }}
          className="relative h-full w-full overflow-hidden"
        >
          <ImageErrorState alt={image.alt} />
        </motion.div>
      ) : (
        <motion.div
          layoutId={`gallery-image-${image.id}`}
          transition={SPRING_TRANSITION}
          style={{ borderRadius: BORDER_RADIUS, opacity: isActive ? 0 : 1 }}
          className="relative h-full w-full overflow-hidden"
        >
          <motion.img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            tabIndex={-1}
            loading="lazy"
            decoding="async"
            onError={() => setHasError(true)}
            whileHover={{ scale: coverScale * 1.02 }}
            whileTap={{ scale: coverScale }}
            style={{ scale: coverScale }}
            className="relative h-full w-full object-contain"
            transition={SPRING_TRANSITION}
          />
        </motion.div>
      )}

      {overlayCount && <OverflowOverlay count={overlayCount} />}
    </div>
  );
}

function computeImageLayout(image: GridImage) {
  const imageAspect = image.width / image.height;
  const isPortrait = imageAspect < 1;
  const isSquarish = imageAspect >= 0.9 && imageAspect <= 1.1;
  const shouldSpanTwoRows = isPortrait && !isSquarish;

  // Container aspect ratio:
  // - Square cells (1:1) for non-spanning items
  // - ~1:2 cells for spanning items (row-span-2 where each row is roughly square)
  const containerAspect = shouldSpanTwoRows ? 0.5 : 1;

  // Scale needed to simulate object-cover using object-contain
  // If image is wider than container: scale up to fill width
  // If image is taller than container: scale up to fill height
  const coverScale =
    imageAspect > containerAspect
      ? imageAspect / containerAspect
      : containerAspect / imageAspect;

  return {
    shouldSpanTwoRows,
    coverScale,
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
