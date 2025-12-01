"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled for Three.js components
const AsciiSceneCanvas = dynamic(
  () =>
    import("@/app/components/visuals/spinning-hexnut/ascii-scene").then(
      (mod) => mod.AsciiScene,
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

export function HomeAsciiScene() {
  return <AsciiSceneCanvas width={200} height={200} />;
}
