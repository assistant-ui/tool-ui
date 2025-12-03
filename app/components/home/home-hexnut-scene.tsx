"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled for Three.js components
const HexnutSceneCanvas = dynamic(
  () =>
    import("@/app/components/visuals/spinning-hexnut/hexnut-scene").then(
      (mod) => mod.HexnutScene,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "600px",
          height: "600px",
          backgroundColor: "transparent",
        }}
      />
    ),
  },
);

export function HomeHexnutScene() {
  return <HexnutSceneCanvas width={200} height={200} />;
}
