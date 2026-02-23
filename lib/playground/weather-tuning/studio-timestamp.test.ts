import { describe, expect, it } from "vitest";

import { createStudioTimestamp } from "@/app/sandbox/weather-tuning/lib/studio-timestamp";

describe("studio timestamp generation", () => {
  it("is date-invariant for a given time-of-day", () => {
    const january = createStudioTimestamp(
      0.5,
      new Date("2025-01-15T00:00:00.000Z"),
    );
    const july = createStudioTimestamp(
      0.5,
      new Date("2025-07-15T00:00:00.000Z"),
    );

    expect(january).toBe(july);
  });
});
