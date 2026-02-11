import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import { buildToolUiRegistryArtifacts } from "@/lib/registry/tool-ui-registry";

function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "../../..");
}

describe("Tool UI registry artifacts", () => {
  async function listExpectedComponents(): Promise<string[]> {
    const projectRoot = getProjectRoot();
    const componentRoot = path.join(projectRoot, "components", "tool-ui");
    const entries = await fs.readdir(componentRoot, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => name !== "shared")
      .sort((a, b) => a.localeCompare(b));
  }

  it("builds a flat index and per-item content payloads", async () => {
    const artifacts = await buildToolUiRegistryArtifacts(getProjectRoot());
    const itemNames = artifacts.items.map((item) => item.name).sort();
    const expectedComponents = await listExpectedComponents();

    expect(itemNames).toEqual(expectedComponents);

    expect(artifacts.index.items).toHaveLength(artifacts.items.length);

    for (const indexItem of artifacts.index.items) {
      for (const file of indexItem.files ?? []) {
        expect(Object.prototype.hasOwnProperty.call(file, "content")).toBe(
          false,
        );
      }
    }

    const dataTableItem = artifacts.items.find(
      (item) => item.name === "data-table",
    );
    expect(dataTableItem).toBeDefined();
    expect(
      dataTableItem?.files.some((file) =>
        file.path.endsWith("data-table/data-table.tsx"),
      ),
    ).toBe(true);
    expect(
      dataTableItem?.files.some(
        (file) => file.path === "components/tool-ui/shared/action-buttons.tsx",
      ),
    ).toBe(true);
    expect(
      dataTableItem?.files.some((file) => file.path === "lib/ui/cn.ts"),
    ).toBe(false);
    const dataTableAdapter = dataTableItem?.files.find(
      (file) => file.path === "components/tool-ui/data-table/_adapter.tsx",
    );
    expect(dataTableAdapter?.content).toContain('export { cn } from "@/lib/utils";');
    expect(dataTableItem?.dependencies?.includes("clsx")).toBe(false);
    expect(dataTableItem?.dependencies?.includes("tailwind-merge")).toBe(false);
    expect(dataTableItem?.dependencies?.includes("zod")).toBe(true);
    expect(dataTableItem?.registryDependencies).toEqual([
      "accordion",
      "badge",
      "button",
      "dropdown-menu",
      "table",
      "tooltip",
    ]);
  });
});
