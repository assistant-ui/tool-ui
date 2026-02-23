import { describe, expect, it } from "vitest";

import {
  loadWorkflowState,
  saveWorkflowState,
  type WorkflowState,
} from "@/app/sandbox/weather-tuning/lib/workflow-state";

const STORAGE_KEY = "weather-tuning-studio-session";

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe("weather-tuning workflow state persistence", () => {
  it("persists repo checkpoint overrides across reload", () => {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "window", {
      value: { localStorage: storage },
      configurable: true,
    });

    const state: WorkflowState = {
      checkpoints: {
        clear: {
          dawn: "reviewed",
          noon: "pending",
          dusk: "pending",
          midnight: "pending",
        },
      },
      signedOff: ["clear"],
      repoCheckpointOverrides: {
        clear: {
          dawn: { glass: { depth: 9, strength: 95 } },
          noon: {},
          dusk: {},
          midnight: {},
        },
      },
    };

    saveWorkflowState(state);

    const raw = storage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(raw).toContain("repoCheckpointOverrides");

    const loaded = loadWorkflowState();
    expect(loaded?.repoCheckpointOverrides?.clear?.dawn?.glass?.depth).toBe(9);
    expect(loaded?.repoCheckpointOverrides?.clear?.dawn?.glass?.strength).toBe(
      95,
    );
  });
});
