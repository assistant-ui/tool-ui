"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ImageGalleryItem } from "./schema";

interface ImageGalleryContextValue {
  images: ImageGalleryItem[];
  activeIndex: number | null;
  exitingIndex: number | null;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  clearExitingIndex: () => void;
}

const ImageGalleryContext = createContext<ImageGalleryContextValue | null>(
  null,
);

export function useImageGallery() {
  const context = useContext(ImageGalleryContext);
  if (!context) {
    throw new Error("useImageGallery must be used within ImageGalleryProvider");
  }
  return context;
}

interface ImageGalleryProviderProps {
  images: ImageGalleryItem[];
  children: React.ReactNode;
}

export function ImageGalleryProvider({
  images,
  children,
}: ImageGalleryProviderProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    if (activeIndex === null) return;
    setExitingIndex(activeIndex);
    setActiveIndex(null);
  }, [activeIndex]);

  const clearExitingIndex = useCallback(() => {
    setExitingIndex(null);
  }, []);

  const value = useMemo(
    () => ({
      images,
      activeIndex,
      exitingIndex,
      openLightbox,
      closeLightbox,
      clearExitingIndex,
    }),
    [images, activeIndex, exitingIndex, openLightbox, closeLightbox, clearExitingIndex],
  );

  return (
    <ImageGalleryContext.Provider value={value}>
      {children}
    </ImageGalleryContext.Provider>
  );
}
