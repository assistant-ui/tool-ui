# Weather Compositor Preset System

## Overview

Add preset management and persistence to the weather-compositor sandbox for tuning composited weather effects.

## Requirements

1. **Condition-based presets** — Toggle between the 13 weather conditions to see composited effects
2. **Per-condition persistence** — Each condition remembers its own tweaked parameter overrides
3. **Dual storage** — localStorage for live tuning, JSON export for committing good values
4. **Pill bar UI** — Horizontal row of condition buttons outside Leva panel

## Data Structure

```typescript
interface CompositorState {
  activeCondition: WeatherCondition;
  overrides: Partial<Record<WeatherCondition, ConditionOverrides>>;
}

interface ConditionOverrides {
  layers?: Partial<LayerToggles>;
  celestial?: Partial<CelestialParams>;
  cloud?: Partial<CloudParams>;
  rain?: Partial<RainParams>;
  lightning?: Partial<LightningParams>;
  snow?: Partial<SnowParams>;
}
```

- Base values derived from `mapWeatherToEffects()` in parameter-mapper.ts
- Overrides merged on top of base values
- localStorage key: `weather-compositor-state`

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Clear] [Partly Cloudy] [Cloudy] ... [Snow] [Sleet]  💾 📂  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Weather Preview                          │
│                      (400×280)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                    [Leva Panel]
```

- Pills: `text-xs`, dark theme styling
- Active pill: ring highlight
- Icon buttons: Save (download JSON), Import (file picker), Reset (clear overrides)

## Implementation Notes

- Use Leva's `set()` API to programmatically update controls when condition changes
- Debounce localStorage writes to avoid excessive saves
- Export triggers browser download of `presets.json`
- Import reads file and merges into localStorage state
