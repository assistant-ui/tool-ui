import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import { buildToolUiRegistryArtifacts } from "@/lib/registry/tool-ui-registry";

function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "../../..");
}

function normalizeDependencySpecifier(specifier: string): string {
  if (specifier.startsWith("@")) {
    const secondSlash = specifier.indexOf("/", 1);
    if (secondSlash === -1) return specifier;
    const versionSeparator = specifier.indexOf("@", secondSlash + 1);
    return versionSeparator === -1
      ? specifier
      : specifier.slice(0, versionSeparator);
  }

  const versionSeparator = specifier.indexOf("@");
  return versionSeparator === -1
    ? specifier
    : specifier.slice(0, versionSeparator);
}

function normalizeImportSpecifier(specifier: string): string {
  const withoutQuery = specifier.split("?")[0];
  if (withoutQuery.startsWith("@")) {
    const [scope, name] = withoutQuery.split("/");
    return `${scope}/${name}`;
  }
  return withoutQuery.split("/")[0];
}

function collectExternalImportPackages(source: string): string[] {
  const packages = new Set<string>();
  const staticImportRegex =
    /\b(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImportRegex = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

  const addIfExternal = (specifier: string) => {
    if (
      specifier.startsWith(".") ||
      specifier.startsWith("/") ||
      specifier.startsWith("@/")
    ) {
      return;
    }
    packages.add(normalizeImportSpecifier(specifier));
  };

  let match: RegExpExecArray | null;
  while ((match = staticImportRegex.exec(source)) !== null) {
    addIfExternal(match[1]);
  }
  while ((match = dynamicImportRegex.exec(source)) !== null) {
    addIfExternal(match[1]);
  }

  return Array.from(packages).sort((a, b) => a.localeCompare(b));
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
    ).toBe(false);
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

  it("includes accordion/collapsible registry dependencies for motion primitives", async () => {
    const artifacts = await buildToolUiRegistryArtifacts(getProjectRoot());

    const expectations = new Map<string, string[]>([
      ["plan", ["accordion", "collapsible"]],
      ["data-table", ["accordion"]],
      ["code-block", ["collapsible"]],
      ["terminal", ["collapsible"]],
    ]);

    for (const [componentName, requiredDependencies] of expectations) {
      const item = artifacts.items.find((candidate) => candidate.name === componentName);
      expect(item, `missing registry item: ${componentName}`).toBeDefined();

      for (const dependency of requiredDependencies) {
        expect(item?.registryDependencies ?? []).toContain(dependency);
      }
    }
  });

  it("pins chart dependency to a recharts v2 release compatible with shadcn charts", async () => {
    const artifacts = await buildToolUiRegistryArtifacts(getProjectRoot());
    const chartItem = artifacts.items.find((item) => item.name === "chart");

    expect(chartItem, "missing registry item: chart").toBeDefined();
    expect(chartItem?.dependencies ?? []).toContain("recharts@2.15.4");
    expect(chartItem?.dependencies ?? []).not.toContain("recharts");
  });

  it("keeps progress-tracker registry dependencies minimal", async () => {
    const artifacts = await buildToolUiRegistryArtifacts(getProjectRoot());
    const progressTrackerItem = artifacts.items.find(
      (item) => item.name === "progress-tracker",
    );

    expect(
      progressTrackerItem,
      "missing registry item: progress-tracker",
    ).toBeDefined();
    expect(progressTrackerItem?.registryDependencies ?? []).not.toContain(
      "button",
    );
  });

  it("includes local type-only import files required by shipped schemas", async () => {
    const artifacts = await buildToolUiRegistryArtifacts(getProjectRoot());

    const componentsRequiringEmbeddedActions = [
      "option-list",
      "parameter-slider",
      "preferences-panel",
    ] as const;

    for (const componentName of componentsRequiringEmbeddedActions) {
      const item = artifacts.items.find((candidate) => candidate.name === componentName);
      expect(item, `missing registry item: ${componentName}`).toBeDefined();

      const itemPaths = new Set(item?.files.map((file) => file.path) ?? []);
      expect(itemPaths.has("components/tool-ui/shared/embedded-actions.ts")).toBe(
        true,
      );
    }
  });

  it("ships weather-widget as runtime-entry closure without authoring-only effects files", async () => {
    const artifacts = await buildToolUiRegistryArtifacts(getProjectRoot());
    const weatherWidgetItem = artifacts.items.find(
      (item) => item.name === "weather-widget",
    );

    expect(weatherWidgetItem, "missing registry item: weather-widget").toBeDefined();

    const weatherPaths = new Set(
      weatherWidgetItem?.files.map((file) => file.path) ?? [],
    );
    expect(weatherPaths.size).toBe(5);

    expect(weatherPaths.has("components/tool-ui/weather-widget/runtime.ts")).toBe(
      true,
    );
    expect(weatherPaths.has("components/tool-ui/weather-widget/schema-runtime.ts")).toBe(
      true,
    );
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/generated/weather-runtime-core.generated.ts",
      ),
    ).toBe(true);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/weather-widget-container.tsx",
      ),
    ).toBe(true);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/weather-data-overlay.tsx",
      ),
    ).toBe(true);

    expect(
      weatherPaths.has("components/tool-ui/weather-widget/effects/index.ts"),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/tuned-presets.ts",
      ),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/weather-effect-shaders.ts",
      ),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/use-glass-region.ts",
      ),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/glass-panel-svg.tsx",
      ),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/custom-effect-props.ts",
      ),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/effect-compositor-custom-props.ts",
      ),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/checkpoint-overrides.ts",
      ),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/parameter-mapper.ts",
      ),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/weather-effect-render-passes.ts",
      ),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "components/tool-ui/weather-widget/effects/use-weather-effects-renderer.ts",
      ),
    ).toBe(false);
    expect(weatherPaths.has("components/tool-ui/weather-widget/weather-widget.generated.js")).toBe(false);
    expect(
      weatherPaths.has("lib/weather-authoring/weather-widget/weather-widget-container.tsx"),
    ).toBe(false);
    expect(
      weatherPaths.has(
        "lib/weather-authoring/weather-widget/effects/parameter-mapper.ts",
      ),
    ).toBe(false);
    expect(weatherPaths.has("components/tool-ui/weather-widget/schema.ts")).toBe(
      false,
    );
    expect(weatherPaths.has("components/tool-ui/shared/contract.ts")).toBe(false);
    expect(weatherPaths.has("components/tool-ui/shared/parse.ts")).toBe(false);
  });

  it("declares every external code-diff import dependency except react peers", async () => {
    const artifacts = await buildToolUiRegistryArtifacts(getProjectRoot());
    const codeDiffItem = artifacts.items.find((item) => item.name === "code-diff");

    expect(codeDiffItem, "missing registry item: code-diff").toBeDefined();

    const codeDiffFile = codeDiffItem?.files.find((file) =>
      file.path.endsWith("components/tool-ui/code-diff/code-diff.tsx"),
    );

    expect(codeDiffFile?.content, "missing code-diff source in registry item").toBeTruthy();

    const imports = collectExternalImportPackages(codeDiffFile?.content ?? "").filter(
      (pkg) => pkg !== "react",
    );
    const declaredDependencies = new Set(
      (codeDiffItem?.dependencies ?? []).map(normalizeDependencySpecifier),
    );

    for (const externalPackage of imports) {
      expect(
        declaredDependencies.has(externalPackage),
        `missing dependency "${externalPackage}" for code-diff`,
      ).toBe(true);
    }
  });
});
