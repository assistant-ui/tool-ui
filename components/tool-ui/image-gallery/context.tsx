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
  activeCoverScale: number;
  openLightbox: (index: number, coverScale: number) => void;
  closeLightbox: () => void;
  clearExitingIndex: () => void;
}

const ImageGalleryContext = createContext<ImageGalleryContextValue | null>(
  null,
);

export function useImageGallery(): ImageGalleryContextValue {
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
  const [activeCoverScale, setActiveCoverScale] = useState<number>(1);

  const openLightbox = useCallback((index: number, coverScale: number) => {
    setActiveIndex(index);
    setActiveCoverScale(coverScale);
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveIndex((current) => {
      if (current !== null) {
        setExitingIndex(current);
      }
      return null;
    });
  }, []);

  const clearExitingIndex = useCallback(() => {
    setExitingIndex(null);
  }, []);

  const value = useMemo<ImageGalleryContextValue>(
    () => ({
      images,
      activeIndex,
      exitingIndex,
      activeCoverScale,
      openLightbox,
      closeLightbox,
      clearExitingIndex,
    }),
    [images, activeIndex, exitingIndex, activeCoverScale, openLightbox, closeLightbox, clearExitingIndex],
  );

  return (
    <ImageGalleryContext.Provider value={value}>
      {children}
    </ImageGalleryContext.Provider>
  );
}
