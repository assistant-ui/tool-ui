export type DisplayMode = "inline" | "pip" | "fullscreen";

export interface AlbumPhoto {
  id: string;
  title?: string;
  url: string;
}

export interface Album {
  id: string;
  title: string;
  cover: string;
  photos: AlbumPhoto[];
}

export interface PizzazAlbumsProps {
  albums?: Album[];
  displayMode?: DisplayMode;
  maxHeight?: number;
  className?: string;
  onRequestDisplayMode?: (mode: DisplayMode) => Promise<{ mode: DisplayMode }>;
}
