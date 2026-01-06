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

const BORDER_RADIUS = 12;

const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const FADE_TRANSITION = {
  duration: 0.3,
  ease: [0.32, 0.72, 0, 1] as const,
};

export function GalleryLightbox() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastOpenedIndexRef = useRef(0);

  const {
    images,
    activeIndex,
    exitingIndex,
    closeLightbox,
    clearExitingIndex,
  } = useImageGallery();

  const isOpen = activeIndex !== null;
  const isAnimatingOut = exitingIndex !== null;
  const shouldKeepDialogOpen = isOpen || isAnimatingOut;

  const displayIndex =
    activeIndex ?? exitingIndex ?? lastOpenedIndexRef.current;
  const currentImage = images[displayIndex] ?? null;

  if (activeIndex !== null) {
    lastOpenedIndexRef.current = activeIndex;
  }

  useEscapeKey(isOpen, closeLightbox);

  const handleExitComplete = useCallback(() => {
    clearExitingIndex();
  }, [clearExitingIndex]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        closeLightbox();
      }
    },
    [closeLightbox],
  );

  return (
    <motion.dialog
      ref={dialogRef}
      layoutRoot
      open={shouldKeepDialogOpen}
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-50 m-0 h-full max-h-full w-full max-w-full",
        "overflow-hidden p-0",
        "bg-transparent backdrop:bg-transparent",
        "focus:outline-none",
      )}
      aria-label="Image lightbox"
    >
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isOpen && currentImage && (
          <LightboxContent image={currentImage} onClose={closeLightbox} />
        )}
      </AnimatePresence>
    </motion.dialog>
  );
}

function useEscapeKey(isActive: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onEscape]);
}

interface LightboxContentProps {
  image: LightboxImage;
  onClose: () => void;
}

function LightboxContent({ image, onClose }: LightboxContentProps) {
  return (
    <motion.div
      key="lightbox-container"
      className="relative h-full w-full"
    >
      <LightboxBackdrop onClose={onClose} />
      <LightboxCloseButton onClose={onClose} />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 p-8">
        <LightboxImage image={image} />
        <LightboxMetadata image={image} />
      </div>
    </motion.div>
  );
}

interface LightboxBackdropProps {
  onClose: () => void;
}

function LightboxBackdrop({ onClose }: LightboxBackdropProps) {
  return (
    <motion.div
      key="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE_TRANSITION}
      onClick={onClose}
      aria-hidden="true"
      className="absolute inset-0 bg-black/90"
    />
  );
}

interface LightboxCloseButtonProps {
  onClose: () => void;
}

function LightboxCloseButton({ onClose }: LightboxCloseButtonProps) {
  return (
    <motion.div
      key="lightbox-close"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={FADE_TRANSITION}
      className="absolute top-4 right-4 z-20"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="text-white/80 hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </Button>
    </motion.div>
  );
}

interface LightboxImageProps {
  image: LightboxImage;
}

function LightboxImage({ image }: LightboxImageProps) {
  const [hasError, setHasError] = useState(false);
  const { activeCoverScale, getLayoutId } = useImageGallery();

  const layoutId = getLayoutId(image.id);

  if (hasError) {
    return (
      <motion.div
        layoutId={layoutId}
        style={{ borderRadius: BORDER_RADIUS }}
        transition={SPRING_TRANSITION}
        className="flex flex-col items-center gap-3 text-white/60"
      >
        <ImageOff className="h-12 w-12" />
        <span className="max-w-xs text-center text-sm">{image.alt}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={layoutId}
      style={{ borderRadius: BORDER_RADIUS }}
      transition={SPRING_TRANSITION}
      className="relative w-fit max-w-full overflow-hidden shadow-2xl"
    >
      <motion.img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        draggable={false}
        onError={() => setHasError(true)}
        initial={{ scale: activeCoverScale }}
        animate={{ scale: 1 }}
        exit={{ scale: activeCoverScale }}
        transition={SPRING_TRANSITION}
        style={{ transformOrigin: "center" }}
        className="block max-h-[80vh] max-w-full object-contain select-none"
      />
    </motion.div>
  );
}

interface LightboxMetadataProps {
  image: Pick<LightboxImage, "title" | "caption" | "source">;
}

function LightboxMetadata({ image }: LightboxMetadataProps) {
  const hasTitle = Boolean(image.title);
  const hasCaption = Boolean(image.caption);
  const hasSource = Boolean(image.source?.label);
  const hasAnyMetadata = hasTitle || hasCaption || hasSource;

  if (!hasAnyMetadata) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ ...FADE_TRANSITION, delay: 0.1 }}
      className="text-center"
    >
      {hasTitle && (
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
  if (!source.url) {
    return <>{source.label}</>;
  }

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
