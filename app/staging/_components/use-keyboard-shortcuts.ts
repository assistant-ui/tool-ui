"use client";

import { useEffect } from "react";
import { useStagingStore, usePresetNames } from "./use-staging-state";

export function useKeyboardShortcuts() {
  const { setPreset, cycleDebugLevel } = useStagingStore();
  const presetNames = usePresetNames();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Number keys 1-9 for preset selection
      if (event.key >= "1" && event.key <= "9") {
        const index = parseInt(event.key, 10) - 1;
        if (index < presetNames.length) {
          setPreset(presetNames[index]);
        }
        return;
      }

      // D to cycle debug levels
      if (event.key.toLowerCase() === "d") {
        cycleDebugLevel();
        return;
      }

    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presetNames, setPreset, cycleDebugLevel]);
}
