"use client";

import { useCallback } from "react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type { WeatherEffectsOverrides } from "@/components/tool-ui/weather-widget/effects/tuning";
import type { CheckpointOverrides, ConditionOverrides } from "../../weather-compositor/presets";
import { WEATHER_CONDITIONS } from "../../weather-compositor/presets";
import type { TimeCheckpoint } from "../types";

type ExportFormat =
  | "json-overrides"
  | "json-full"
  | "typescript"
  | "typescript-tool-ui";

interface ExportOptions {
  format: ExportFormat;
  conditions?: WeatherCondition[];
  includeMetadata?: boolean;
}

const CHECKPOINTS: TimeCheckpoint[] = ["dawn", "noon", "dusk", "midnight"];

function isObjectEmpty(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.keys(value as Record<string, unknown>).length === 0
  );
}

function mapConditionOverridesToToolUi(
  input: ConditionOverrides
): WeatherEffectsOverrides {
  const out: WeatherEffectsOverrides = {};

  if (input.layers) {
    out.layers = input.layers;
  }

  if (input.celestial) {
    // Avoid exporting timeOfDay (it’s derived from timestamp in production).
    const { timeOfDay: _timeOfDay, ...rest } = input.celestial;
    if (!isObjectEmpty(rest)) {
      out.celestial = rest;
    }
  }

  if (input.cloud) {
    const {
      cloudScale,
      coverage,
      density,
      softness,
      windSpeed,
      windAngle,
      turbulence,
      lightIntensity,
      ambientDarkness,
      backlightIntensity,
      numLayers,
    } = input.cloud;

    const cloud: Record<string, unknown> = {
      ...(cloudScale !== undefined ? { cloudScale } : {}),
      ...(coverage !== undefined ? { coverage } : {}),
      ...(density !== undefined ? { density } : {}),
      ...(softness !== undefined ? { softness } : {}),
      ...(windSpeed !== undefined ? { windSpeed } : {}),
      ...(windAngle !== undefined ? { windAngle } : {}),
      ...(turbulence !== undefined ? { turbulence } : {}),
      ...(lightIntensity !== undefined ? { lightIntensity } : {}),
      ...(ambientDarkness !== undefined ? { ambientDarkness } : {}),
      ...(backlightIntensity !== undefined ? { backlightIntensity } : {}),
      ...(numLayers !== undefined ? { numLayers } : {}),
    };

    if (!isObjectEmpty(cloud)) {
      out.cloud = cloud as WeatherEffectsOverrides["cloud"];
    }
  }

  const interactions: Record<string, unknown> = {};

  if (input.rain) {
    const {
      glassIntensity,
      zoom,
      fallingIntensity,
      fallingSpeed,
      fallingAngle,
      fallingStreakLength,
      fallingLayers,
      fallingRefraction,
    } = input.rain;

    const rain: Record<string, unknown> = {
      ...(glassIntensity !== undefined ? { glassIntensity } : {}),
      ...(zoom !== undefined ? { glassZoom: zoom } : {}),
      ...(fallingIntensity !== undefined ? { fallingIntensity } : {}),
      ...(fallingSpeed !== undefined ? { fallingSpeed } : {}),
      ...(fallingAngle !== undefined ? { fallingAngle } : {}),
      ...(fallingStreakLength !== undefined ? { fallingStreakLength } : {}),
      ...(fallingLayers !== undefined ? { fallingLayers } : {}),
    };

    if (!isObjectEmpty(rain)) {
      out.rain = rain as WeatherEffectsOverrides["rain"];
    }

    if (fallingRefraction !== undefined) {
      interactions.rainRefractionStrength = fallingRefraction;
    }
  }

  if (input.lightning || input.layers?.lightning === true) {
    const {
      branchDensity,
      glowIntensity,
      autoMode,
      autoInterval,
      sceneIllumination,
    } = input.lightning ?? {};

    const lightning: Record<string, unknown> = {
      enabled: true,
      ...(autoMode !== undefined ? { autoMode } : {}),
      ...(autoInterval !== undefined ? { autoInterval } : {}),
      ...(branchDensity !== undefined ? { branchDensity } : {}),
      ...(glowIntensity !== undefined ? { flashIntensity: glowIntensity } : {}),
    };

    if (!isObjectEmpty(lightning)) {
      out.lightning = lightning as WeatherEffectsOverrides["lightning"];
    }

    if (sceneIllumination !== undefined) {
      interactions.lightningSceneIllumination = sceneIllumination;
    }
  }

  if (input.snow) {
    const {
      intensity,
      layers,
      fallSpeed,
      windSpeed,
      windAngle,
      turbulence,
      drift,
      flutter,
      windShear,
      flakeSize,
      sizeVariation,
      opacity,
      glowAmount,
      sparkle,
    } = input.snow;

    const snow: Record<string, unknown> = {
      ...(intensity !== undefined ? { intensity } : {}),
      ...(layers !== undefined ? { layers } : {}),
      ...(fallSpeed !== undefined ? { fallSpeed } : {}),
      ...(windSpeed !== undefined ? { windSpeed } : {}),
      ...(windAngle !== undefined ? { windAngle } : {}),
      ...(turbulence !== undefined ? { turbulence } : {}),
      ...(drift !== undefined ? { drift } : {}),
      ...(flutter !== undefined ? { flutter } : {}),
      ...(windShear !== undefined ? { windShear } : {}),
      ...(flakeSize !== undefined ? { flakeSize } : {}),
      ...(sizeVariation !== undefined ? { sizeVariation } : {}),
      ...(opacity !== undefined ? { opacity } : {}),
      ...(glowAmount !== undefined ? { glowAmount } : {}),
      ...(sparkle !== undefined ? { sparkle } : {}),
    };

    if (!isObjectEmpty(snow)) {
      out.snow = snow as WeatherEffectsOverrides["snow"];
    }
  }

  if (!isObjectEmpty(interactions)) {
    out.interactions = interactions as WeatherEffectsOverrides["interactions"];
  }

  return out;
}

export function useCodeGen(
  checkpointOverrides: Partial<Record<WeatherCondition, CheckpointOverrides>>,
  signedOff: Set<WeatherCondition>
) {
  const generateJson = useCallback(
    (options: ExportOptions): string => {
      const conditionsToExport =
        options.conditions ?? WEATHER_CONDITIONS.filter((c) => checkpointOverrides[c]);

      const data: Record<string, unknown> = {};

      if (options.includeMetadata) {
        data.exportedAt = new Date().toISOString();
        data.signedOff = Array.from(signedOff);
        data.version = 2;
      }

      data.checkpointOverrides = {};
      for (const condition of conditionsToExport) {
        if (checkpointOverrides[condition]) {
          (data.checkpointOverrides as Record<string, CheckpointOverrides>)[condition] =
            checkpointOverrides[condition]!;
        }
      }

      return JSON.stringify(data, null, 2);
    },
    [checkpointOverrides, signedOff]
  );

  const generateConditionOverrideCode = (conditionOverride: ConditionOverrides, indent: string): string[] => {
    const lines: string[] = [];

    if (conditionOverride.layers) {
      lines.push(`${indent}layers: {`);
      for (const [key, value] of Object.entries(conditionOverride.layers)) {
        lines.push(`${indent}  ${key}: ${JSON.stringify(value)},`);
      }
      lines.push(`${indent}},`);
    }

    if (conditionOverride.celestial) {
      lines.push(`${indent}celestial: {`);
      for (const [key, value] of Object.entries(conditionOverride.celestial)) {
        lines.push(`${indent}  ${key}: ${typeof value === "number" ? value.toFixed(4) : JSON.stringify(value)},`);
      }
      lines.push(`${indent}},`);
    }

    if (conditionOverride.cloud) {
      lines.push(`${indent}cloud: {`);
      for (const [key, value] of Object.entries(conditionOverride.cloud)) {
        lines.push(`${indent}  ${key}: ${typeof value === "number" ? value.toFixed(4) : JSON.stringify(value)},`);
      }
      lines.push(`${indent}},`);
    }

    if (conditionOverride.rain) {
      lines.push(`${indent}rain: {`);
      for (const [key, value] of Object.entries(conditionOverride.rain)) {
        lines.push(`${indent}  ${key}: ${typeof value === "number" ? value.toFixed(4) : JSON.stringify(value)},`);
      }
      lines.push(`${indent}},`);
    }

    if (conditionOverride.lightning) {
      lines.push(`${indent}lightning: {`);
      for (const [key, value] of Object.entries(conditionOverride.lightning)) {
        lines.push(`${indent}  ${key}: ${typeof value === "number" ? value.toFixed(4) : JSON.stringify(value)},`);
      }
      lines.push(`${indent}},`);
    }

    if (conditionOverride.snow) {
      lines.push(`${indent}snow: {`);
      for (const [key, value] of Object.entries(conditionOverride.snow)) {
        lines.push(`${indent}  ${key}: ${typeof value === "number" ? value.toFixed(4) : JSON.stringify(value)},`);
      }
      lines.push(`${indent}},`);
    }

    return lines;
  };

  const generateTypeScript = useCallback((): string => {
    const lines: string[] = [
      "// Generated by Weather Tuning Studio",
      `// Exported at: ${new Date().toISOString()}`,
      "",
      "import type { CheckpointOverrides } from './presets';",
      "import type { WeatherCondition } from '@/components/tool-ui/weather-widget/schema';",
      "",
      "export const TUNED_CHECKPOINT_OVERRIDES: Partial<Record<WeatherCondition, CheckpointOverrides>> = {",
    ];

    for (const condition of WEATHER_CONDITIONS) {
      const conditionCheckpoints = checkpointOverrides[condition];
      if (!conditionCheckpoints) continue;

      const isSignedOff = signedOff.has(condition);
      lines.push(`  // ${condition}${isSignedOff ? " ✓ signed off" : ""}`);
      lines.push(`  "${condition}": {`);

      for (const checkpoint of CHECKPOINTS) {
        const checkpointData = conditionCheckpoints[checkpoint];
        if (!checkpointData || Object.keys(checkpointData).length === 0) {
          lines.push(`    ${checkpoint}: {},`);
          continue;
        }

        lines.push(`    ${checkpoint}: {`);
        const overrideLines = generateConditionOverrideCode(checkpointData, "      ");
        lines.push(...overrideLines);
        lines.push("    },");
      }

      lines.push("  },");
    }

    lines.push("};");
    lines.push("");

    return lines.join("\n");
  }, [checkpointOverrides, signedOff]);

  const generateToolUiTypeScript = useCallback((): string => {
    const lines: string[] = [
      "// Generated by Weather Tuning Studio",
      `// Exported at: ${new Date().toISOString()}`,
      "",
      "import type { WeatherCondition } from \"../schema\";",
      "import type { WeatherEffectsCheckpointOverrides } from \"./tuning\";",
      "",
      "export const TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES: Partial<Record<WeatherCondition, WeatherEffectsCheckpointOverrides>> = {",
    ];

    for (const condition of WEATHER_CONDITIONS) {
      const conditionCheckpoints = checkpointOverrides[condition];
      if (!conditionCheckpoints) continue;

      const isSignedOff = signedOff.has(condition);
      lines.push(`  // ${condition}${isSignedOff ? " ✓ signed off" : ""}`);
      lines.push(`  "${condition}": {`);

      for (const checkpoint of CHECKPOINTS) {
        const checkpointData = conditionCheckpoints[checkpoint];
        if (!checkpointData || Object.keys(checkpointData).length === 0) {
          lines.push(`    ${checkpoint}: {},`);
          continue;
        }

        const mapped = mapConditionOverridesToToolUi(checkpointData);

        if (Object.keys(mapped).length === 0) {
          lines.push(`    ${checkpoint}: {},`);
          continue;
        }

        lines.push(`    ${checkpoint}: {`);

        const writeGroup = (key: keyof WeatherEffectsOverrides) => {
          const value = mapped[key];
          if (!value || isObjectEmpty(value)) return;
          lines.push(`      ${key}: {`);
          for (const [k, v] of Object.entries(value)) {
            lines.push(
              `        ${k}: ${typeof v === "number" ? v.toFixed(4) : JSON.stringify(v)},`
            );
          }
          lines.push("      },");
        };

        writeGroup("layers");
        writeGroup("celestial");
        writeGroup("cloud");
        writeGroup("rain");
        writeGroup("lightning");
        writeGroup("snow");
        writeGroup("interactions");

        lines.push("    },");
      }

      lines.push("  },");
    }

    lines.push("};");
    lines.push("");

    return lines.join("\n");
  }, [checkpointOverrides, signedOff]);

  const copyToClipboard = useCallback(
    async (options: ExportOptions): Promise<boolean> => {
      let content: string;

      if (options.format === "typescript") {
        content = generateTypeScript();
      } else if (options.format === "typescript-tool-ui") {
        content = generateToolUiTypeScript();
      } else {
        content = generateJson(options);
      }

      // Prefer modern Clipboard API.
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(content);
          return true;
        }
      } catch {
        // Fall back to a legacy copy approach below.
      }

      // Fallback: execCommand('copy') via a temporary textarea.
      // This is less reliable but avoids throwing in browsers that block the Clipboard API.
      try {
        const textarea = document.createElement("textarea");
        textarea.value = content;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "0";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        textarea.remove();
        return ok;
      } catch (error) {
        console.warn("Failed to copy export to clipboard.", error);
        return false;
      }
    },
    [generateJson, generateTypeScript, generateToolUiTypeScript]
  );

  const downloadFile = useCallback(
    (options: ExportOptions): void => {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (options.format === "typescript") {
        content = generateTypeScript();
        filename = "tuned-overrides.ts";
        mimeType = "text/typescript";
      } else if (options.format === "typescript-tool-ui") {
        content = generateToolUiTypeScript();
        filename = "tuned-presets.ts";
        mimeType = "text/typescript";
      } else {
        content = generateJson(options);
        filename = "weather-tuning-export.json";
        mimeType = "application/json";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    [generateJson, generateTypeScript, generateToolUiTypeScript]
  );

  return {
    generateJson,
    generateTypeScript,
    generateToolUiTypeScript,
    copyToClipboard,
    downloadFile,
  };
}
