"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn, Button, X, ImageOff } from "./_adapter";
import { useImageGallery } from "./context";
import type { ImageGalleryItem } from "./schema";

type LightboxImage = Pick<
  ImageGalleryItem,
  "id" | "src" | "alt" | "width" | "height" | "title" | "caption" | "source"
>;

const imageTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

const backdropTransition = {
  duration: 0.3,
  ease: [0.32, 0.72, 0, 1] as const,
};

export function GalleryLightbox() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const displayIndexRef = useRef<number>(0);

  const { images, activeIndex, exitingIndex, closeLightbox, clearExitingIndex } =
    useImageGallery();

  const isOpen = activeIndex !== null;
  const shouldKeepDialogOpen = isOpen || exitingIndex !== null;

  const displayIndex = activeIndex ?? exitingIndex ?? displayIndexRef.current;
  if (activeIndex !== null) {
    displayIndexRef.current = activeIndex;
  }

  const currentImage = images[displayIndex] ?? null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (shouldKeepDialogOpen && !dialog.open) {
      dialog.showModal();
    }
  }, [shouldKeepDialogOpen]);

  const handleExitComplete = useCallback(() => {
    dialogRef.current?.close();
    clearExitingIndex();
  }, [clearExitingIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeLightbox]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        closeLightbox();
      }
    },
    [closeLightbox],
  );

  const handleDialogCancel = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      closeLightbox();
    },
    [closeLightbox],
  );

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onCancel={handleDialogCancel}
      className={cn(
        "fixed inset-0 m-0 h-full max-h-full w-full max-w-full",
        "overflow-hidden p-0",
        "bg-transparent",
        "backdrop:bg-transparent",
        "focus:outline-none",
      )}
      aria-label="Image lightbox"
    >
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isOpen && currentImage && (
          <div key="lightbox-container" className="relative h-full w-full">
            <motion.div
              key="lightbox-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={backdropTransition}
              className="absolute inset-0 bg-black/90"
            />

            <motion.div
              key="lightbox-close"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={backdropTransition}
              className="absolute right-4 top-4 z-20"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 p-8">
              <LightboxImage image={currentImage} />
              <ImageMetadata image={currentImage} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

interface LightboxImageProps {
  image: LightboxImage;
}

function LightboxImage({ image }: LightboxImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <motion.div
        layoutId={`gallery-image-${image.id}`}
        style={{ borderRadius: 12 }}
        transition={imageTransition}
        className="flex flex-col items-center gap-3 text-white/60 !opacity-100"
      >
        <ImageOff className="h-12 w-12" />
        <span className="max-w-xs text-center text-sm">{image.alt}</span>
      </motion.div>
    );
  }

  return (
    <motion.img
      layout
      layoutId={`gallery-image-${image.id}`}
      src={image.src}
      alt={image.alt}
      draggable={false}
      onError={() => setError(true)}
      style={{ borderRadius: 12 }}
      transition={imageTransition}
      className="max-h-[80vh] max-w-full object-contain shadow-2xl select-none !opacity-100"
    />
  );
}

interface ImageMetadataProps {
  image: Pick<LightboxImage, "title" | "caption" | "source">;
}

function ImageMetadata({ image }: ImageMetadataProps) {
  const hasSource = Boolean(image.source?.label);
  const hasCaption = Boolean(image.caption);

  if (!image.title && !hasCaption && !hasSource) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ ...backdropTransition, delay: 0.1 }}
      className="text-center"
    >
      {image.title && (
        <h3 className="text-base font-medium tracking-tight text-white">
          {image.title}
        </h3>
      )}
      {(hasCaption || hasSource) && (
        <p className="mt-1 text-sm text-white/60">
          {image.caption}
          {hasCaption && hasSource && " · "}
          {hasSource && <SourceLink source={image.source!} />}
        </p>
      )}
    </motion.div>
  );
}

interface SourceLinkProps {
  source: NonNullable<LightboxImage["source"]>;
}

function SourceLink({ source }: SourceLinkProps) {
  if (source.url) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white/80 hover:underline"
      >
        {source.label}
      </a>
    );
  }
  return <>{source.label}</>;
}
