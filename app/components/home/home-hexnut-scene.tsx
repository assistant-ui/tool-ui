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
    loading: () => <div className="size-36 sm:size-48 bg-transparent" />,
  },
);

export function HomeHexnutScene() {
  return (
    <div className="size-36 sm:size-48">
      <HexnutSceneCanvas width="100%" height="100%" />
    </div>
  );
}
