"use client";

import { useMemo } from "react";
import { App as HypercubeCanvas } from "@/components/rotating-hypercube";
import { useHomeStore, CHAT_MAX_SIZE, CHAT_MIN_SIZE } from "./home-store";

export function HomeHypercube() {
  const chatPanelSize = useHomeStore((state) => state.chatPanelSize);

  const cubeWidth = useMemo(() => {
    return (
      2 +
      ((chatPanelSize - CHAT_MIN_SIZE) / (CHAT_MAX_SIZE - CHAT_MIN_SIZE)) * 2
    );
  }, [chatPanelSize]);

  return <HypercubeCanvas cubeWidth={cubeWidth} />;
}
