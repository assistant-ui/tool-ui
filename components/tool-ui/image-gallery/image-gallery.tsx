"use client";

import { LayoutGroup } from "motion/react";
import { cn } from "./_adapter";
import { ImageGalleryProvider } from "./context";
import { GalleryGrid } from "./gallery-grid";
import { GalleryLightbox } from "./gallery-lightbox";
import type { ImageGalleryProps } from "./schema";

function ImageGalleryProgress() {
  return (
    <div className="flex w-full motion-safe:animate-pulse flex-col gap-3 p-4">
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted aspect-square rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

function ImageGalleryHeader({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  if (!title && !description) return null;

  return (
    <div className="border-border/60 border-b px-4 pt-4 pb-3">
      {title && (
        <h3 className="text-[15px] leading-tight font-semibold tracking-tight">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-muted-foreground mt-1 text-sm leading-snug">
          {description}
        </p>
      )}
    </div>
  );
}

export function ImageGallery({
  id,
  images,
  maxVisible,
  title,
  description,
  className,
  isLoading,
  onImageClick,
}: ImageGalleryProps) {
  const handleImageClick = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (image && onImageClick) {
      onImageClick(imageId, image);
    }
  };

  return (
    <article
      className={cn("relative w-full min-w-80 max-w-lg", className)}
      aria-busy={isLoading}
      data-tool-ui-id={id}
      data-slot="image-gallery"
    >
      <div
        className={cn(
          "@container relative isolate flex w-full min-w-0 flex-col rounded-xl",
          "border border-border bg-card text-sm shadow-xs",
        )}
      >
        {isLoading ? (
          <ImageGalleryProgress />
        ) : (
          <ImageGalleryProvider images={images}>
            <LayoutGroup>
              <ImageGalleryHeader title={title} description={description} />
              <div className="p-3">
                <GalleryGrid
                  maxVisible={maxVisible}
                  onImageClick={handleImageClick}
                />
              </div>
              <GalleryLightbox />
            </LayoutGroup>
          </ImageGalleryProvider>
        )}
      </div>
    </article>
  );
}
