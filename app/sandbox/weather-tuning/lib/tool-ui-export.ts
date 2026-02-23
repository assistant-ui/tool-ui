import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import {
  TIME_CHECKPOINTS,
  type TimeCheckpoint,
  type WeatherEffectsCheckpointOverrides,
  type WeatherEffectsOverrides,
  type WeatherEffectsTunedPresets,
} from "@/lib/weather-authoring/weather-widget/effects/tuning";
import type {
  CheckpointOverrides,
  ConditionOverrides,
} from "../../weather-compositor/presets";
import {
  extractOverrides,
  getRawBaseParamsForCondition,
  mergeWithOverrides,
} from "../../weather-compositor/presets";
import { createStudioTimestamp } from "./studio-timestamp";

const CHECKPOINTS: TimeCheckpoint[] = ["dawn", "noon", "dusk", "midnight"];

export const WEATHER_CONDITION_ORDER: WeatherConditionCode[] = [
  "clear",
  "partly-cloudy",
  "cloudy",
  "overcast",
  "fog",
  "drizzle",
  "rain",
  "heavy-rain",
  "thunderstorm",
  "snow",
  "sleet",
  "hail",
  "windy",
];

function isObjectEmpty(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.keys(value as Record<string, unknown>).length === 0
  );
}

export function mapConditionOverridesToToolUi(
  input: ConditionOverrides,
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

  if (input.glass) {
    const {
      enabled,
      depth,
      strength,
      chromaticAberration,
      blur,
      brightness,
      saturation,
    } = input.glass;

    const glass: Record<string, unknown> = {
      ...(enabled !== undefined ? { enabled } : {}),
      ...(depth !== undefined ? { depth } : {}),
      ...(strength !== undefined ? { strength } : {}),
      ...(chromaticAberration !== undefined ? { chromaticAberration } : {}),
      ...(blur !== undefined ? { blur } : {}),
      ...(brightness !== undefined ? { brightness } : {}),
      ...(saturation !== undefined ? { saturation } : {}),
    };

    if (!isObjectEmpty(glass)) {
      out.glass = glass as WeatherEffectsOverrides["glass"];
    }
  }

  if (!isObjectEmpty(interactions)) {
    out.interactions = interactions as WeatherEffectsOverrides["interactions"];
  }

  if (input.post) {
    out.post = input.post as WeatherEffectsOverrides["post"];
  }

  return out;
}

function mergeGroup<T extends object>(
  base: Partial<T> | undefined,
  delta: Partial<T> | undefined,
): Partial<T> | undefined {
  if (!base && !delta) return undefined;
  return { ...base, ...delta };
}

export function mergeWeatherEffectsOverrides(
  base: WeatherEffectsOverrides | undefined,
  delta: WeatherEffectsOverrides | undefined,
): WeatherEffectsOverrides {
  return {
    layers: mergeGroup(base?.layers, delta?.layers),
    celestial: mergeGroup(base?.celestial, delta?.celestial),
    cloud: mergeGroup(base?.cloud, delta?.cloud),
    rain: mergeGroup(base?.rain, delta?.rain),
    lightning: mergeGroup(base?.lightning, delta?.lightning),
    snow: mergeGroup(base?.snow, delta?.snow),
    glass: mergeGroup(base?.glass, delta?.glass),
    interactions: mergeGroup(base?.interactions, delta?.interactions),
    post: mergeGroup(base?.post, delta?.post),
  };
}

export function mergeTunedPresets(
  base: WeatherEffectsTunedPresets,
  delta: WeatherEffectsTunedPresets,
): WeatherEffectsTunedPresets {
  const out: WeatherEffectsTunedPresets = { ...base };
  const conditions = new Set<WeatherConditionCode>([
    ...(Object.keys(base) as WeatherConditionCode[]),
    ...(Object.keys(delta) as WeatherConditionCode[]),
  ]);

  for (const condition of conditions) {
    const baseCheckpoints = base[condition];
    const deltaCheckpoints = delta[condition];
    if (!baseCheckpoints && !deltaCheckpoints) continue;

    const merged: WeatherEffectsCheckpointOverrides = {
      dawn: mergeWeatherEffectsOverrides(
        baseCheckpoints?.dawn,
        deltaCheckpoints?.dawn,
      ),
      noon: mergeWeatherEffectsOverrides(
        baseCheckpoints?.noon,
        deltaCheckpoints?.noon,
      ),
      dusk: mergeWeatherEffectsOverrides(
        baseCheckpoints?.dusk,
        deltaCheckpoints?.dusk,
      ),
      midnight: mergeWeatherEffectsOverrides(
        baseCheckpoints?.midnight,
        deltaCheckpoints?.midnight,
      ),
    };

    out[condition] = merged;
  }

  return out;
}

function hasAnyOverrideGroups(
  checkpoints: WeatherEffectsCheckpointOverrides,
): boolean {
  return CHECKPOINTS.some((checkpoint) => {
    const groups = checkpoints[checkpoint];
    return Object.keys(groups).some((key) => {
      const value = (groups as Record<string, unknown>)[key];
      return value && !isObjectEmpty(value);
    });
  });
}

export function buildCanonicalToolUiPresetsForEditedConditions(
  editedCheckpointOverrides: Partial<
    Record<WeatherConditionCode, CheckpointOverrides>
  >,
  repoCheckpointOverrides: Partial<
    Record<WeatherConditionCode, CheckpointOverrides>
  >,
): WeatherEffectsTunedPresets {
  const out: WeatherEffectsTunedPresets = {};

  for (const condition of Object.keys(
    editedCheckpointOverrides,
  ) as WeatherConditionCode[]) {
    const edited = editedCheckpointOverrides[condition];
    if (!edited) continue;

    const mapped: WeatherEffectsCheckpointOverrides = {
      dawn: {},
      noon: {},
      dusk: {},
      midnight: {},
    };

    for (const checkpoint of CHECKPOINTS) {
      const timeOfDay = TIME_CHECKPOINTS[checkpoint];
      const timestamp = createStudioTimestamp(timeOfDay);
      const rawBase = getRawBaseParamsForCondition(condition, timestamp);
      rawBase.celestial.timeOfDay = timeOfDay;

      const withRepo = mergeWithOverrides(
        rawBase,
        repoCheckpointOverrides[condition]?.[checkpoint],
      );
      const effective = mergeWithOverrides(withRepo, edited[checkpoint]);
      const canonicalOverrides = extractOverrides(effective, rawBase);
      mapped[checkpoint] = mapConditionOverridesToToolUi(canonicalOverrides);
    }

    out[condition] = mapped;
  }

  return out;
}

export function replaceEditedConditions(
  base: WeatherEffectsTunedPresets,
  editedConditionPresets: WeatherEffectsTunedPresets,
): WeatherEffectsTunedPresets {
  const out: WeatherEffectsTunedPresets = { ...base };

  for (const condition of Object.keys(
    editedConditionPresets,
  ) as WeatherConditionCode[]) {
    const nextCondition = editedConditionPresets[condition];
    if (nextCondition && hasAnyOverrideGroups(nextCondition)) {
      out[condition] = nextCondition;
    } else {
      delete out[condition];
    }
  }

  return out;
}

export function toToolUiDelta(
  checkpointOverrides: Partial<
    Record<WeatherConditionCode, CheckpointOverrides>
  >,
): WeatherEffectsTunedPresets {
  const out: WeatherEffectsTunedPresets = {};

  for (const condition of Object.keys(
    checkpointOverrides,
  ) as WeatherConditionCode[]) {
    const byCheckpoint = checkpointOverrides[condition];
    if (!byCheckpoint) continue;

    const mapped: Partial<WeatherEffectsCheckpointOverrides> = {};

    for (const checkpoint of CHECKPOINTS) {
      const conditionOverrides = byCheckpoint[checkpoint];
      if (!conditionOverrides) continue;
      const toolUi = mapConditionOverridesToToolUi(conditionOverrides);
      if (Object.keys(toolUi).length === 0) continue;
      mapped[checkpoint] = toolUi;
    }

    if (Object.keys(mapped).length > 0) {
      out[condition] = {
        dawn: mapped.dawn ?? {},
        noon: mapped.noon ?? {},
        dusk: mapped.dusk ?? {},
        midnight: mapped.midnight ?? {},
      };
    }
  }

  return out;
}

export function generateToolUiTypeScript(
  presets: WeatherEffectsTunedPresets,
  signedOff: Set<WeatherConditionCode>,
  exportedAt: string = new Date().toISOString(),
): string {
  const lines: string[] = [
    "// Generated by Weather Tuning Studio",
    `// Exported at: ${exportedAt}`,
    "",
    'import type { WeatherConditionCode } from "../schema";',
    'import type { WeatherEffectsCheckpointOverrides } from "./tuning";',
    "",
    "export const TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES: Partial<Record<WeatherConditionCode, WeatherEffectsCheckpointOverrides>> = {",
  ];

  for (const condition of WEATHER_CONDITION_ORDER) {
    const conditionCheckpoints = presets[condition];
    if (!conditionCheckpoints) continue;

    const isSigned = signedOff.has(condition);
    lines.push(`  // ${condition}${isSigned ? " ✓ signed off" : ""}`);
    lines.push(`  "${condition}": {`);

    for (const checkpoint of CHECKPOINTS) {
      const checkpointData = conditionCheckpoints[checkpoint] ?? {};
      const hasAnyGroups = Object.keys(checkpointData).some((key) => {
        const value = (checkpointData as Record<string, unknown>)[key];
        return value && !isObjectEmpty(value);
      });

      if (!hasAnyGroups) {
        lines.push(`    ${checkpoint}: {},`);
        continue;
      }

      lines.push(`    ${checkpoint}: {`);

      const writeGroup = (key: keyof WeatherEffectsOverrides) => {
        const value = checkpointData[key];
        if (!value || isObjectEmpty(value)) return;
        lines.push(`      ${key}: {`);
        for (const [k, v] of Object.entries(value)) {
          lines.push(
            `        ${k}: ${typeof v === "number" ? v.toFixed(4) : JSON.stringify(v)},`,
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
      writeGroup("glass");
      writeGroup("interactions");
      writeGroup("post");

      lines.push("    },");
    }

    lines.push("  },");
  }

  lines.push("};");
  lines.push("");

  return lines.join("\n");
}
