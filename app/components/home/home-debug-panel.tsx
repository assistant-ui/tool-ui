"use client";

import { Leva } from "leva";
import { useHomeStore } from "./home-store";

export function HomeDebugPanel() {
  const showLogoDebug = useHomeStore((state) => state.showLogoDebug);
  return <Leva hidden={!showLogoDebug} collapsed={!showLogoDebug} />;
}

