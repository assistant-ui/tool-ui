// @vitest-environment node

import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
} from "@/lib/weather-authoring/weather-widget/effects/generated/tuned-presets.generated";
import * as generatedShaders from "@/lib/weather-authoring/weather-widget/effects/generated/weather-effect-shaders.generated";
import {
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES as bundledRuntimeTunedOverrides,
} from "@/components/tool-ui/weather-widget/generated/weather-runtime-core.generated";
import {
  canonicalizeWeatherPresetData,
  getStaleWeatherRuntimeArtifacts,
  loadWeatherAuthoringPreset,
  loadWeatherAuthoringShaders,
  minifyWeatherShaderSource,
} from "@/lib/weather-codegen/compile-weather-runtime";

const PROJECT_ROOT = process.cwd();
const WEATHER_RUNTIME_BUNDLE_PATH =
  "components/tool-ui/weather-widget/generated/weather-runtime-core.generated.ts";
const WEATHER_RUNTIME_MAX_BYTES = 120_000;
const WEATHER_RUNTIME_MAX_LINES = 120;
const WEATHER_REGISTRY_ENTRY_PATH = "public/r/weather-widget.json";
const WEATHER_REGISTRY_MAX_BYTES = 170_000;
const WEATHER_REGISTRY_RUNTIME_FILES = [
  "components/tool-ui/weather-widget/generated/weather-runtime-core.generated.ts",
  "components/tool-ui/weather-widget/runtime.ts",
  "components/tool-ui/weather-widget/schema-runtime.ts",
  "components/tool-ui/weather-widget/weather-data-overlay.tsx",
  "components/tool-ui/weather-widget/weather-widget-container.tsx",
] as const;
const SHADER_EXPORT_NAMES = [
  "FULLSCREEN_VERTEX",
  "CELESTIAL_FRAGMENT",
  "CLOUD_FRAGMENT",
  "RAIN_FRAGMENT",
  "LIGHTNING_FRAGMENT",
  "SNOW_FRAGMENT",
  "COMPOSITE_FRAGMENT",
] as const;

describe("weather runtime codegen", () => {
  test("bundled runtime does not reference removed component asset paths", () => {
    const bundledRuntimePath = path.join(
      PROJECT_ROOT,
      WEATHER_RUNTIME_BUNDLE_PATH,
    );
    const bundledRuntime = readFileSync(bundledRuntimePath, "utf8");

    expect(bundledRuntime).not.toContain("../assets/moon-texture.jpg");
  });

  test("shipped weather runtime files do not import private authoring modules", () => {
    const registryEntryPath = path.join(
      PROJECT_ROOT,
      "public/r/weather-widget.json",
    );
    const registryEntryRaw = readFileSync(registryEntryPath, "utf8");
    const registryEntry = JSON.parse(registryEntryRaw) as {
      files: Array<{ path: string }>;
    };

    for (const file of registryEntry.files) {
      const absolutePath = path.join(PROJECT_ROOT, file.path);
      const source = readFileSync(absolutePath, "utf8");
      expect(source).not.toMatch(
        /\bfrom\s+["']@\/lib\/weather-authoring\//,
      );
      expect(source).not.toMatch(
        /\bimport\s*\(\s*["']@\/lib\/weather-authoring\//,
      );
    }
  });

  test("generated artifacts are not stale", async () => {
    await expect(getStaleWeatherRuntimeArtifacts(PROJECT_ROOT)).resolves.toEqual(
      [],
    );
  });

  test("bundled runtime stays under size budget", () => {
    const bundledRuntimePath = path.join(
      PROJECT_ROOT,
      WEATHER_RUNTIME_BUNDLE_PATH,
    );
    const bundledRuntime = readFileSync(bundledRuntimePath, "utf8");
    const lineCount = bundledRuntime.split("\n").length;
    const byteCount = Buffer.byteLength(bundledRuntime, "utf8");

    expect(lineCount).toBeLessThanOrEqual(WEATHER_RUNTIME_MAX_LINES);
    expect(byteCount).toBeLessThanOrEqual(WEATHER_RUNTIME_MAX_BYTES);
  });

  test("weather registry payload stays under size budget", () => {
    const registryEntryPath = path.join(PROJECT_ROOT, WEATHER_REGISTRY_ENTRY_PATH);
    const registryEntry = readFileSync(registryEntryPath, "utf8");
    const byteCount = Buffer.byteLength(registryEntry, "utf8");

    expect(byteCount).toBeLessThanOrEqual(WEATHER_REGISTRY_MAX_BYTES);
  });

  test("bundled runtime uses the generated tuned preset overrides", () => {
    expect(bundledRuntimeTunedOverrides).toEqual(
      TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
    );
  });

  test("weather registry payload embeds the current runtime files", () => {
    const registryEntryPath = path.join(PROJECT_ROOT, WEATHER_REGISTRY_ENTRY_PATH);
    const registryEntry = JSON.parse(readFileSync(registryEntryPath, "utf8")) as {
      files: Array<{ path: string; content?: string }>;
    };
    const fileContentsByPath = new Map(
      registryEntry.files.map((file) => [file.path, file.content] as const),
    );

    expect(fileContentsByPath.size).toBe(WEATHER_REGISTRY_RUNTIME_FILES.length);

    for (const relativePath of WEATHER_REGISTRY_RUNTIME_FILES) {
      const embedded = fileContentsByPath.get(relativePath);
      expect(typeof embedded).toBe("string");

      const currentFileContents = readFileSync(
        path.join(PROJECT_ROOT, relativePath),
        "utf8",
      );

      expect(embedded).toBe(currentFileContents);
    }
  });

  test("generated presets match canonicalized authoring source", () => {
    const authoringPreset = loadWeatherAuthoringPreset(PROJECT_ROOT);

    expect(TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES).toEqual(
      canonicalizeWeatherPresetData(authoringPreset),
    );
  });

  test("generated shader module matches minified authoring sources", () => {
    const authoringShaders = loadWeatherAuthoringShaders(PROJECT_ROOT);
    const shaderExports = generatedShaders as Record<string, string>;

    for (const exportName of SHADER_EXPORT_NAMES) {
      expect(shaderExports[exportName]).toBe(
        minifyWeatherShaderSource(authoringShaders[exportName]),
      );
    }
  });
});
