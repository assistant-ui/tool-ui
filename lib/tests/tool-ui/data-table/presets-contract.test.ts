import { describe, expect, test } from "vitest";
import { dataTablePresets } from "@/lib/presets/data-table";

describe("data-table presets contract", () => {
  test("omits the resources preset from docs previews", () => {
    expect(Object.keys(dataTablePresets)).toEqual(["stocks", "tasks", "actions"]);
    expect(dataTablePresets).not.toHaveProperty("resources");
  });
});
