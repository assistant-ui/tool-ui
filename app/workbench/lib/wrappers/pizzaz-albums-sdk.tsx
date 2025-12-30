"use client";

import { useCallback } from "react";
import {
  PizzazAlbums,
  DEFAULT_ALBUMS,
  type Album,
  type DisplayMode,
} from "@/components/tool-ui/pizzaz-albums";
import {
  useDisplayMode,
  useOpenAiGlobal,
  useRequestDisplayMode,
} from "../openai-context";

interface PizzazAlbumsInput {
  albums?: Album[];
}

export function PizzazAlbumsSDK(props: Record<string, unknown>) {
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const maxHeight = useOpenAiGlobal("maxHeight");

  const { albums } = props as PizzazAlbumsInput;
  const resolvedAlbums = Array.isArray(albums) ? albums : DEFAULT_ALBUMS;

  const handleRequestDisplayMode = useCallback(
    (mode: DisplayMode) => requestDisplayMode({ mode }),
    [requestDisplayMode],
  );

  return (
    <PizzazAlbums
      albums={resolvedAlbums}
      displayMode={displayMode}
      maxHeight={maxHeight}
      onRequestDisplayMode={handleRequestDisplayMode}
    />
  );
}
