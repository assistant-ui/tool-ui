"use client";

import * as React from "react";
import type { SerializableMediaCard } from "./schema";

export type MediaCardUIState = {
  playing?: boolean;
  muted?: boolean;
  selected?: boolean;
};

export interface MediaCardClientProps {
  className?: string;
  maxWidth?: string;
  isLoading?: boolean;
  state?: MediaCardUIState;
  defaultState?: MediaCardUIState;
  onStateChange?: (state: MediaCardUIState) => void;
  onNavigate?: (href: string, card: SerializableMediaCard) => void;
  onAction?: (actionId: string, card: SerializableMediaCard) => void;
  onBeforeAction?: (args: { action: string; card: SerializableMediaCard }) => boolean | Promise<boolean>;
  onMediaEvent?: (type: "play" | "pause" | "mute" | "unmute", payload?: unknown) => void;
}

export interface MediaCardContextValue {
  card: SerializableMediaCard;
  locale: string;
  resolvedHref?: string;
  resolvedSourceUrl?: string;
  state: MediaCardUIState;
  setState: (patch: Partial<MediaCardUIState>) => void;
  handlers: Pick<MediaCardClientProps, "onNavigate" | "onAction" | "onBeforeAction" | "onMediaEvent">;
  mediaElement: HTMLMediaElement | null;
  setMediaElement: (node: HTMLMediaElement | null) => void;
}

const MediaCardContext = React.createContext<MediaCardContextValue | null>(null);

export function useMediaCard() {
  const ctx = React.useContext(MediaCardContext);
  if (!ctx) {
    throw new Error("useMediaCard must be used within a <MediaCardProvider />");
  }
  return ctx;
}

export function MediaCardProvider({
  value,
  children,
}: {
  value: MediaCardContextValue;
  children: React.ReactNode;
}) {
  return <MediaCardContext.Provider value={value}>{children}</MediaCardContext.Provider>;
}
