"use client";

import { create } from "zustand";
import type { ResizableViewportSize } from "@/app/components/resizable-viewport-controls";

type Layout = [number, number, number];

export const CHAT_MIN_SIZE = 50;
export const CHAT_MAX_SIZE = 100;

export const CHAT_LAYOUTS: Record<ResizableViewportSize, Layout> = {
  mobile: [25, CHAT_MIN_SIZE, 25],
  desktop: [0, CHAT_MAX_SIZE, 0],
};

const VIEWPORT_THRESHOLD =
  (CHAT_LAYOUTS.mobile[1] + CHAT_LAYOUTS.desktop[1]) / 2;

interface HomeState {
  viewport: ResizableViewportSize;
  chatLayout: Layout;
  chatPanelSize: number;
  showLogoDebug: boolean;
  setViewport: (viewport: ResizableViewportSize) => void;
  setChatLayout: (sizes: Layout | number[]) => void;
  setShowLogoDebug: (value: boolean) => void;
}

function normalizeLayout(sizes: number[]): Layout {
  const chat = Math.min(CHAT_MAX_SIZE, Math.max(CHAT_MIN_SIZE, sizes[1] ?? 0));
  const spacing = Math.max(0, (100 - chat) / 2);

  return [spacing, chat, spacing];
}

export const useHomeStore = create<HomeState>((set) => ({
  viewport: "desktop",
  chatLayout: CHAT_LAYOUTS.desktop,
  chatPanelSize: CHAT_LAYOUTS.desktop[1],
  showLogoDebug: false,
  setViewport: (viewport) =>
    set(() => {
      const layout = CHAT_LAYOUTS[viewport];
      return {
        viewport,
        chatLayout: layout,
        chatPanelSize: layout[1],
      };
    }),
  setChatLayout: (sizes) =>
    set((state) => {
      const layout = normalizeLayout(sizes as number[]);
      const chatPanelSize = layout[1];
      const viewport =
        chatPanelSize <= VIEWPORT_THRESHOLD ? "mobile" : "desktop";

      if (
        state.chatPanelSize === chatPanelSize &&
        state.viewport === viewport &&
        state.chatLayout[0] === layout[0]
      ) {
        return state;
      }

      return {
        viewport,
        chatLayout: layout,
        chatPanelSize,
      };
    }),
  setShowLogoDebug: (value) => set(() => ({ showLogoDebug: value })),
}));


