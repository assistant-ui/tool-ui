"use client";

import { useMemo, lazy, Suspense } from "react";
import { useHomeStore, CHAT_MAX_SIZE, CHAT_MIN_SIZE } from "./home-store";

// Lazy load the three.js component to defer initialization
const HypercubeCanvas = lazy(() =>
  import("@/app/components/visuals/rotating-hypercube").then((mod) => ({
    default: mod.App,
  })),
);

export function HomeHypercube() {
  const chatPanelSize = useHomeStore((state) => state.chatPanelSize);

  const cubeWidth = useMemo(() => {
    return (
      2 +
      ((chatPanelSize - CHAT_MIN_SIZE) / (CHAT_MAX_SIZE - CHAT_MIN_SIZE)) * 2
    );
  }, [chatPanelSize]);

  return (
    <Suspense
      fallback={
        <div
          style={{
            width: "200px",
            height: "200px",
            backgroundColor: "transparent",
          }}
        />
      }
    >
      <HypercubeCanvas cubeWidth={cubeWidth} />
    </Suspense>
  );
}
