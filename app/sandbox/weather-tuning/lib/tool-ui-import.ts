import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import type {
  WeatherEffectsCheckpointOverrides,
  WeatherEffectsOverrides,
  WeatherEffectsTunedPresets,
} from "@/lib/weather-authoring/weather-widget/effects/tuning";
import type {
  CheckpointOverrides,
  ConditionOverrides,
} from "../../weather-compositor/presets";

function isEmptyObject(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.keys(value as Record<string, unknown>).length === 0
  );
}

export function mapToolUiOverridesToCompositor(
  input: WeatherEffectsOverrides,
): ConditionOverrides {
  const out: ConditionOverrides = {};

  if (input.layers && !isEmptyObject(input.layers)) {
    out.layers = input.layers as ConditionOverrides["layers"];
  }

  if (input.celestial && !isEmptyObject(input.celestial)) {
    out.celestial = input.celestial as ConditionOverrides["celestial"];
  }

  if (input.cloud && !isEmptyObject(input.cloud)) {
    out.cloud = input.cloud as ConditionOverrides["cloud"];
  }

  if (input.rain && !isEmptyObject(input.rain)) {
    const rain: Record<string, unknown> = { ...(input.rain as object) };
    if ("glassZoom" in rain) {
      const zoom = rain.glassZoom as number | undefined;
      delete rain.glassZoom;
      if (zoom !== undefined) {
        rain.zoom = zoom;
      }
    }
    out.rain = rain as ConditionOverrides["rain"];
  }

  if (input.lightning && !isEmptyObject(input.lightning)) {
    const lightning: Record<string, unknown> = {
      ...(input.lightning as object),
    };
    if ("flashIntensity" in lightning) {
      const glowIntensity = lightning.flashIntensity as number | undefined;
      delete lightning.flashIntensity;
      if (glowIntensity !== undefined) {
        lightning.glowIntensity = glowIntensity;
      }
    }
    // The studio doesn't need the explicit enabled flag (layers controls visibility).
    delete lightning.enabled;
    if (!isEmptyObject(lightning)) {
      out.lightning = lightning as ConditionOverrides["lightning"];
    }
  }

  if (input.snow && !isEmptyObject(input.snow)) {
    out.snow = input.snow as ConditionOverrides["snow"];
  }

  if (input.glass && !isEmptyObject(input.glass)) {
    out.glass = input.glass as ConditionOverrides["glass"];
  }

  if (input.post && !isEmptyObject(input.post)) {
    out.post = input.post as ConditionOverrides["post"];
  }

  if (input.interactions && !isEmptyObject(input.interactions)) {
    const interactions = input.interactions as Record<string, unknown>;

    if (typeof interactions.rainRefractionStrength === "number") {
      out.rain = {
        ...out.rain,
        fallingRefraction: interactions.rainRefractionStrength,
      } as ConditionOverrides["rain"];
    }

    if (typeof interactions.lightningSceneIllumination === "number") {
      out.lightning = {
        ...out.lightning,
        sceneIllumination: interactions.lightningSceneIllumination,
      } as ConditionOverrides["lightning"];
    }
  }

  return out;
}

export function mapToolUiCheckpointsToCompositor(
  input: WeatherEffectsCheckpointOverrides,
): CheckpointOverrides {
  return {
    dawn: mapToolUiOverridesToCompositor(input.dawn ?? {}),
    noon: mapToolUiOverridesToCompositor(input.noon ?? {}),
    dusk: mapToolUiOverridesToCompositor(input.dusk ?? {}),
    midnight: mapToolUiOverridesToCompositor(input.midnight ?? {}),
  };
}

export function mapToolUiPresetsToCompositor(
  presets: WeatherEffectsTunedPresets,
): Partial<Record<WeatherConditionCode, CheckpointOverrides>> {
  const out: Partial<Record<WeatherConditionCode, CheckpointOverrides>> = {};
  for (const condition of Object.keys(presets) as WeatherConditionCode[]) {
    const byCheckpoint = presets[condition];
    if (!byCheckpoint) continue;
    out[condition] = mapToolUiCheckpointsToCompositor(byCheckpoint);
  }
  return out;
}
