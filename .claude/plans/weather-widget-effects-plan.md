# Weather Widget Effects: Comprehensive Plan

> A premium weather widget with Apple-quality visual effects for AI assistant interfaces.

## Executive Summary

**Goal**: Unify the existing weather widget component with WebGL effect sandboxes (rain, clouds, lightning) to create a visually stunning, schema-driven weather display that rivals Apple Weather's attention to detail.

**Primary Context**: AI assistant responses (inline chat, ~300-400px wide), with graceful scaling for larger dashboard contexts.

**Approach**: Layered effect compositions behind a weather-semantic schema. Start with stacked canvases for development flexibility, optimize later based on real performance data.

---

## Part 1: Goals & Principles

### Success Criteria

1. **Visual Impact**: First reaction should be "wow, that's beautiful"
2. **Authenticity**: Effects should feel physically grounded, not gimmicky
3. **Performance**: Smooth 60fps on modern devices in chat context; graceful degradation on constrained devices
4. **Schema Simplicity**: Consumers pass weather data in natural terms; complexity is internal

### Design Principles

1. **Weather-semantic API** — Schema uses real-world concepts (wind speed, precipitation), not shader parameters
2. **Composition over configuration** — Conditions are layered effect recipes, not monolithic states
3. **Time-aware rendering** — Sun position derived from timestamp creates authentic lighting automatically
4. **Progressive enhancement** — Works without effects; effects enhance when available

---

## Part 2: Schema Specification

### Current Schema (Baseline)

```typescript
interface WeatherWidgetProps {
  id: string;
  location: string;
  current: {
    temp: number;
    tempMin: number;
    tempMax: number;
    condition: WeatherCondition;
  };
  forecast: ForecastDay[];
  unit: "fahrenheit" | "celsius";
  updatedAt: string; // ISO timestamp
  isLoading?: boolean;
}

type WeatherCondition =
  | "clear" | "partly-cloudy" | "cloudy" | "rain" | "thunderstorm"
  | "snow" | "sleet" | "hail" | "fog" | "windy" | "tornado" | "hurricane";
```

### Extended Schema (v1)

```typescript
interface WeatherWidgetProps {
  id: string;
  location: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
  unit: "fahrenheit" | "celsius";
  updatedAt: string; // ISO timestamp — used for sun position calculation
  isLoading?: boolean;

  // New: Effect control
  effects?: EffectSettings;
}

interface CurrentWeather {
  temp: number;
  tempMin: number;
  tempMax: number;
  condition: WeatherConditionV1;

  // New: Weather-semantic parameters
  windSpeed?: number;        // mph — affects rain angle, cloud movement
  windDirection?: number;    // degrees (0-360, 0 = North)
  humidity?: number;         // 0-100 — affects fog density, cloud coverage
  precipitation?: PrecipitationLevel;
  visibility?: number;       // miles — affects atmospheric haze
}

type WeatherConditionV1 =
  | "sunny"          // Clear day
  | "clear-night"    // Clear night (stars visible)
  | "overcast"       // Heavy cloud cover
  | "rain"           // Standard rain
  | "thunderstorm"   // Rain + lightning + dramatic clouds
  | "snow"           // Snowfall
  | "windy";         // Wind effects on clouds (modifier-style)

type PrecipitationLevel = "none" | "light" | "moderate" | "heavy";

interface EffectSettings {
  enabled?: boolean;         // Master toggle (default: true)
  quality?: "low" | "medium" | "high" | "auto";  // Performance tier
  reducedMotion?: boolean;   // Respect prefers-reduced-motion
}
```

### Parameter Mapping Table

| Schema Parameter | Shader Target | Mapping Logic |
|-----------------|---------------|---------------|
| `windSpeed` | Rain: `fallingAngle`, Cloud: `windSpeed` | 0-10mph: subtle, 10-25mph: moderate, 25+mph: dramatic |
| `precipitation` | Rain: `fallingIntensity`, `glassIntensity` | light: 0.3, moderate: 0.6, heavy: 1.0 |
| `humidity` | Cloud: `coverage`, Fog: `density` | Linear scale 0-100 → 0-1 |
| `visibility` | All: atmospheric haze multiplier | 10+ miles: clear, 5-10: haze, <5: fog |
| Sun altitude (derived) | Cloud: `sunAltitude`, All: color palette | Calculated from `updatedAt` using generic 6am/6pm cycle |

### Sun Position Calculation

```typescript
function getSunAltitude(timestamp: string): number {
  const date = new Date(timestamp);
  const hours = date.getHours() + date.getMinutes() / 60;

  // Generic sun cycle: rises at 6am, peaks at noon, sets at 6pm
  // Returns -1 (midnight) to 1 (noon)
  const normalized = (hours - 6) / 6; // 6am = 0, noon = 1, 6pm = 2

  if (normalized < 0) {
    // Before 6am: night to dawn
    return -1 + (normalized + 1); // -1 to 0
  } else if (normalized <= 1) {
    // 6am to noon: rising
    return normalized; // 0 to 1
  } else if (normalized <= 2) {
    // Noon to 6pm: falling
    return 2 - normalized; // 1 to 0
  } else {
    // After 6pm: dusk to night
    return -(normalized - 2); // 0 to -1
  }
}
```

---

## Part 3: Effect Composition System

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   WeatherWidget                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              EffectCompositor                     │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │
│  │  │ Cloud   │ │ Rain    │ │Lightning│            │  │
│  │  │ Canvas  │ │ Canvas  │ │ Canvas  │            │  │
│  │  └─────────┘ └─────────┘ └─────────┘            │  │
│  │         ↑         ↑           ↑                  │  │
│  │         └─────────┴───────────┘                  │  │
│  │                   │                              │  │
│  │         EffectParameterMapper                    │  │
│  │                   │                              │  │
│  │         Schema (condition, windSpeed, etc.)      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │            Weather UI (existing)                  │  │
│  │       Temperature, Forecast Cards, etc.          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Condition → Effect Mapping

| Condition | Cloud Layer | Rain Layer | Lightning Layer | Notes |
|-----------|-------------|------------|-----------------|-------|
| `sunny` | Minimal cirrus | — | — | High sun altitude, light atmosphere |
| `clear-night` | — | — | — | Stars visible, dark sky |
| `overcast` | Full stratus/cumulus | — | — | Low sun penetration |
| `rain` | Stratus coverage | Active | — | Cloud darkness scales with precipitation |
| `thunderstorm` | Dense cumulus | Heavy | Active (auto-trigger) | Full drama mode |
| `snow` | Light stratus | Snow shader* | — | *To be created |
| `windy` | Fast-moving cumulus | — | — | Wind speed drives cloud animation |

### Effect Layer Configuration

```typescript
interface EffectLayerConfig {
  cloud?: {
    type: "cirrus" | "stratus" | "cumulus";
    coverage: number;      // 0-1
    speed: number;         // Wind-driven
    darkness: number;      // For storm clouds
  };
  rain?: {
    intensity: number;     // 0-1
    glassDrops: boolean;   // Window rain effect
    fallingRain: boolean;  // Atmospheric rain
    angle: number;         // Wind-driven
  };
  lightning?: {
    enabled: boolean;
    autoTrigger: boolean;
    interval: [number, number];  // Random range in seconds
  };
  snow?: {
    intensity: number;
    windDrift: number;
  };
  atmosphere?: {
    sunAltitude: number;   // Derived from timestamp
    haze: number;          // Visibility-driven
    starVisibility: number; // Night only
  };
}
```

### Composition Presets

```typescript
const CONDITION_PRESETS: Record<WeatherConditionV1, EffectLayerConfig> = {
  sunny: {
    cloud: { type: "cirrus", coverage: 0.1, speed: 0.3, darkness: 0 },
    atmosphere: { haze: 0.1, starVisibility: 0 }
  },

  "clear-night": {
    atmosphere: { haze: 0.05, starVisibility: 1.0 }
  },

  overcast: {
    cloud: { type: "stratus", coverage: 0.9, speed: 0.4, darkness: 0.3 },
    atmosphere: { haze: 0.3, starVisibility: 0 }
  },

  rain: {
    cloud: { type: "stratus", coverage: 0.8, speed: 0.5, darkness: 0.4 },
    rain: { intensity: 0.6, glassDrops: true, fallingRain: true, angle: 5 },
    atmosphere: { haze: 0.4, starVisibility: 0 }
  },

  thunderstorm: {
    cloud: { type: "cumulus", coverage: 1.0, speed: 0.7, darkness: 0.7 },
    rain: { intensity: 1.0, glassDrops: true, fallingRain: true, angle: 15 },
    lightning: { enabled: true, autoTrigger: true, interval: [4, 12] },
    atmosphere: { haze: 0.5, starVisibility: 0 }
  },

  snow: {
    cloud: { type: "stratus", coverage: 0.7, speed: 0.3, darkness: 0.2 },
    snow: { intensity: 0.7, windDrift: 0.3 },
    atmosphere: { haze: 0.3, starVisibility: 0 }
  },

  windy: {
    cloud: { type: "cumulus", coverage: 0.5, speed: 1.0, darkness: 0.1 },
    atmosphere: { haze: 0.2, starVisibility: 0 }
  }
};
```

---

## Part 4: Implementation Roadmap

### Phase 1: Foundation (Effect Compositor)

**Goal**: Create the abstraction layer that composes effects without modifying existing shaders.

**Tasks**:
1. Create `EffectCompositor` component that manages multiple canvas layers
2. Implement `EffectParameterMapper` — converts schema params to shader uniforms
3. Add sun altitude calculation from timestamp
4. Create responsive sizing system (effect canvases scale to widget dimensions)
5. Implement quality tier detection (device capability, `prefers-reduced-motion`)

**Deliverable**: Can render existing cloud/rain/lightning sandboxes within widget bounds, driven by hardcoded params.

### Phase 2: Schema Integration

**Goal**: Wire schema parameters to effect layers.

**Tasks**:
1. Extend weather widget schema with new fields (windSpeed, precipitation, etc.)
2. Implement condition preset system (condition → EffectLayerConfig)
3. Add parameter interpolation (schema values modify presets)
4. Update Zod schema validation
5. Create new presets in `lib/presets/weather-widget.ts` showcasing effect combinations

**Deliverable**: Schema-driven effects — pass `condition: "thunderstorm"` and see rain + lightning + dramatic clouds.

### Phase 3: Snow Effect

**Goal**: Complete the effect palette with snow shader.

**Tasks**:
1. Create snow effect sandbox (`app/sandbox/snow-effect/`)
2. Implement snowflake rendering (varied sizes, rotation, wind drift)
3. Add accumulation hint (subtle ground brightening)
4. Integrate into EffectCompositor
5. Add snow conditions to presets

**Deliverable**: Full snow rendering, integrated with composition system.

### Phase 4: Polish & Performance

**Goal**: Production-ready quality and performance.

**Tasks**:
1. Profile performance on target devices
2. Implement quality tiers (reduce layers, simplify shaders for "low")
3. Add subtle transitions for internal animations (not cross-condition yet)
4. Fine-tune all presets for visual consistency
5. Handle edge cases (very small widgets, reduced motion, WebGL unavailable)

**Deliverable**: Ship-ready weather widget with effects.

### Phase 5: Future Enhancements (Post-v1)

- Cross-condition transitions (smooth morphing between weather states)
- Additional conditions (fog, sleet, hail, etc.)
- Real coordinates for accurate sun position
- Time-lapse mode (animate through a day)
- Interactive elements (tap for lightning, etc.)

---

## Part 5: Exploration Framework

### Questions to Answer Through Prototyping

#### Visual Fidelity

1. **Canvas sizing**: How small can effects go before looking bad? Is 300px wide enough for rain drops?
2. **Layer blending**: What blend modes work for compositing? Does transparency ordering matter?
3. **Color consistency**: Do all effects look cohesive at same sun altitude? Do we need a unified color palette system?

#### Performance

1. **Baseline cost**: What's the GPU cost of each effect at 300px vs 600px?
2. **Composition overhead**: Stacked canvases vs single canvas — measurable difference?
3. **Mobile impact**: Battery drain? Thermal throttling on sustained animation?

#### User Experience

1. **Distraction factor**: Do effects pull focus from the weather data? Need to tune intensity?
2. **Loading behavior**: Show skeleton while shaders compile? Fade in effects?
3. **Fallback gracefully**: If WebGL fails, what does the widget look like?

### Prototyping Milestones

| Milestone | Goal | Success Metric |
|-----------|------|----------------|
| P1 | Render cloud canvas behind widget UI | Visual layering works, UI remains readable |
| P2 | Render rain + cloud together | Effects composite correctly, no z-fighting |
| P3 | Sun altitude drives lighting | Noon vs midnight looks authentically different |
| P4 | Thunderstorm composition | All three effects active, dramatically coherent |
| P5 | 300px widget performance | 60fps on M1 MacBook, 30fps+ on 2-year-old phone |

---

## Part 6: Open Questions

### Technical

- [ ] Should effects render behind or around the UI chrome? (Current assumption: behind, UI has semi-transparent background)
- [ ] How to handle widget resize? Recreate WebGL context or scale canvas?
- [ ] Should each effect have its own RAF loop or share one coordinator?

### Design

- [ ] What's the right default cloud type for ambiguous conditions?
- [ ] Should "windy" modify other conditions or be standalone? (e.g., "windy rain")
- [ ] How prominent should the glass rain drops be vs falling rain?

### Scope

- [ ] Is 7 conditions enough for v1, or do we need fog/haze for completeness?
- [ ] Should forecast days show mini-effects or just icons?

---

## Appendix: Existing Asset Inventory

### Weather Widget
- **Location**: `components/tool-ui/weather-widget/`
- **Status**: Complete UI, no effects
- **Key files**: `weather-widget.tsx`, `schema.ts`

### Rain Effect
- **Location**: `app/sandbox/rain-effect/`
- **Status**: Production-quality, 13+ parameters
- **Key features**: Glass drops, falling rain, bokeh background

### Cloud Effect
- **Location**: `app/sandbox/cloud-effect/`
- **Status**: Production-quality, 18+ parameters
- **Key features**: 3 cloud types, domain warping, stars, sun altitude

### Lightning Effect
- **Location**: `app/sandbox/lightning-effect/`
- **Status**: Production-quality, 9+ parameters
- **Key features**: Branching bolts, glow, auto-trigger mode

### Research Docs
- **Location**: `.claude/plans/`
- **Files**: Rain, cloud, lightning, atmospheric lighting research
- **Status**: Comprehensive theory and implementation guidance

---

## Next Steps

1. **Review this plan** — Adjust scope, add missing considerations
2. **Begin Phase 1** — Build EffectCompositor abstraction
3. **Prototype P1** — Cloud canvas behind widget as proof-of-concept

---

*Last updated: 2025-01-18*
