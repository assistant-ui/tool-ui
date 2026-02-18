import { describe, expect, test } from "vitest";
import { dataTablePresets } from "@/lib/presets/data-table";

describe("data-table presets contract", () => {
  test("omits the resources preset from docs previews", () => {
    expect(Object.keys(dataTablePresets)).toEqual([
      "stocks",
      "tasks",
      "links-tags",
      "actions",
    ]);
    expect(dataTablePresets).not.toHaveProperty("resources");
  });

  test("includes a links-and-tags focused preset", () => {
    const preset = dataTablePresets["links-tags"];

    expect(preset.data.columns.map((column) => column.key)).toEqual([
      "name",
      "linkLabel",
      "tags",
    ]);
    expect(preset.data.columns[1]?.format).toMatchObject({
      kind: "link",
      hrefKey: "url",
      external: true,
    });
    expect(preset.data.columns[2]?.format).toMatchObject({
      kind: "array",
      maxVisible: 2,
    });
  });

  test("actions preset omits the escalate action", () => {
    const localActions = dataTablePresets.actions.data.localActions ?? [];
    const actionIds = localActions.map((action) => action.id);

    expect(actionIds).toEqual(["close", "assign"]);
    expect(actionIds).not.toContain("escalate");
  });
});
