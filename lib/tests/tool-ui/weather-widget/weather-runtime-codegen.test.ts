// @vitest-environment node

import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
} from "@/lib/weather-authoring/weather-widget/effects/generated/tuned-presets.generated";
import * as generatedShaders from "@/lib/weather-authoring/weather-widget/effects/generated/weather-effect-shaders.generated";
import {
  canonicalizeWeatherPresetData,
  getStaleWeatherRuntimeArtifacts,
  loadWeatherAuthoringPreset,
  loadWeatherAuthoringShaders,
  minifyWeatherShaderSource,
} from "@/lib/weather-codegen/compile-weather-runtime";

const PROJECT_ROOT = process.cwd();
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
      "components/tool-ui/weather-widget/generated/weather-runtime-core.generated.ts",
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
