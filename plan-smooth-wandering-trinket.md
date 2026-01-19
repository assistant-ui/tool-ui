# Glass Refraction Effect for 5-Day Forecast Component

## Research Summary

Creating a realistic glass refraction effect using SVG filters that distorts the background at the edges of the forecast container, simulating light bending through curved glass.

## Current State

The forecast component (`weather-widget.tsx:106-138`) has **no glass effects**. It's plain styled with:
- Simple flex layout with `justify-between`
- Theme-aware text colors only
- Weather effects render via WebGL canvas behind the content

## Technical Approach: SVG Displacement Filters

### Core Concept

Use `feDisplacementMap` to warp pixels based on a displacement map that concentrates distortion at the edges. The formula:

```
P'(x,y) ← P(x + scale * (XC(x,y) - 0.5), y + scale * (YC(x,y) - 0.5))
```

- Values **above 127** shift pixels toward scale direction
- Values **below 127** shift opposite direction
- **Exactly 127** = no displacement (neutral)

### Filter Pipeline

```xml
<svg style="display: none">
  <defs>
    <filter id="glass-refraction" x="-10%" y="-10%" width="120%" height="120%">
      <!-- 1. Edge displacement map (gradient concentrates distortion at borders) -->
      <feImage href="data:image/svg+xml,..." result="displacement" />

      <!-- 2. Apply refraction distortion -->
      <feDisplacementMap
        in="SourceGraphic"
        in2="displacement"
        scale="30"
        xChannelSelector="R"
        yChannelSelector="G"
        result="refracted"
      />

      <!-- 3. Subtle blur for glass softness -->
      <feGaussianBlur in="refracted" stdDeviation="0.5" result="softened" />

      <!-- 4. Chromatic aberration (color fringing at edges) -->
      <feColorMatrix type="saturate" values="1.2" result="saturated" />

      <!-- 5. Specular highlight rim -->
      <feSpecularLighting
        in="softened"
        specularConstant="1.5"
        specularExponent="20"
        lighting-color="rgba(255,255,255,0.3)"
        result="specular">
        <feDistantLight azimuth="225" elevation="30" />
      </feSpecularLighting>

      <!-- 6. Composite final result -->
      <feMerge>
        <feMergeNode in="saturated" />
        <feMergeNode in="specular" />
      </feMerge>
    </filter>
  </defs>
</svg>
```

### Creating Edge-Only Distortion

The displacement map is key. Instead of uniform noise, create a **gradient-based map**:

```
┌──────────────────────────────┐
│ Red gradient: 255→127→255    │  (horizontal edge distortion)
│ Green gradient: 255→127→255  │  (vertical edge distortion)
│      ↓                       │
│  ┌────────────────────┐      │
│  │   Neutral center   │      │  (127,127 = no distortion)
│  │   (no distortion)  │      │
│  └────────────────────┘      │
│      ↑                       │
│ Edges: strong R/G values     │  (creates outward refraction)
└──────────────────────────────┘
```

This can be generated as inline SVG:
```xml
<svg width="300" height="60">
  <defs>
    <linearGradient id="h" x1="0%" x2="100%">
      <stop offset="0%" stop-color="rgb(255,127,127)"/>
      <stop offset="15%" stop-color="rgb(127,127,127)"/>
      <stop offset="85%" stop-color="rgb(127,127,127)"/>
      <stop offset="100%" stop-color="rgb(0,127,127)"/>
    </linearGradient>
    <linearGradient id="v" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgb(127,255,127)"/>
      <stop offset="20%" stop-color="rgb(127,127,127)"/>
      <stop offset="80%" stop-color="rgb(127,127,127)"/>
      <stop offset="100%" stop-color="rgb(127,0,127)"/>
    </linearGradient>
  </defs>
  <rect fill="url(#h)" width="100%" height="100%"/>
  <rect fill="url(#v)" width="100%" height="100%" style="mix-blend-mode:multiply"/>
</svg>
```

## Tunable Parameters

| Parameter | Purpose | Range | Default |
|-----------|---------|-------|---------|
| `refractionScale` | Distortion intensity | 10-80 | 30 |
| `edgeWidth` | How far distortion extends inward | 5-25% | 15% |
| `blurAmount` | Glass softness | 0-2 | 0.5 |
| `chromaticAberration` | Color fringing intensity | 1.0-1.5 | 1.2 |
| `specularIntensity` | Edge highlight strength | 0-2 | 1.5 |
| `lightAngle` | Direction of specular highlight | 0-360° | 225° |

## Implementation: WebGL Shader Approach

### Existing Architecture

The weather widget uses a **multi-pass WebGL pipeline** with ping-pong framebuffers:

```
Celestial → Clouds → Rain → Lightning → Snow → Screen
```

The rain shader already implements refraction via:
- Procedural drop generation with `DropLayer()` and `StaticDrops()`
- Normal computation via finite differences
- UV displacement: `refractedUV = UV + totalRefraction`

### New Glass Panel Shader

Add a dedicated **GLASS_PANEL_FRAGMENT** shader that:
1. Takes a region mask (the forecast panel bounds)
2. Applies edge-concentrated displacement
3. Adds specular rim lighting
4. Blends with subtle chromatic aberration

```glsl
#version 300 es
precision highp float;

uniform sampler2D u_sceneTexture;
uniform vec2 u_resolution;
uniform float u_time;

// Glass panel region (x, y, width, height in normalized coords)
uniform vec4 u_panelRegion;

// Tunable parameters
uniform float u_refractionScale;    // 10-80, default 30
uniform float u_edgeWidth;          // 0.05-0.25, default 0.15
uniform float u_blurAmount;         // 0-2, default 0.5
uniform float u_chromaticAberration; // 1.0-1.5, default 1.2
uniform float u_specularIntensity;  // 0-2, default 1.5
uniform float u_lightAngle;         // radians

in vec2 v_uv;
out vec4 fragColor;

// Compute distance to panel edge (0 at edge, 1 at center)
float edgeDistance(vec2 uv) {
  vec2 panelMin = u_panelRegion.xy;
  vec2 panelMax = u_panelRegion.xy + u_panelRegion.zw;

  // Distance from each edge (normalized to edge width)
  float left = (uv.x - panelMin.x) / u_edgeWidth;
  float right = (panelMax.x - uv.x) / u_edgeWidth;
  float top = (uv.y - panelMin.y) / u_edgeWidth;
  float bottom = (panelMax.y - uv.y) / u_edgeWidth;

  // Minimum distance to any edge
  float dist = min(min(left, right), min(top, bottom));
  return clamp(dist, 0.0, 1.0);
}

// Compute refraction displacement based on edge proximity
vec2 getRefraction(vec2 uv) {
  float edgeDist = edgeDistance(uv);

  // Displacement is strongest at edges (edgeDist = 0)
  // and zero at center (edgeDist = 1)
  float strength = 1.0 - smoothstep(0.0, 1.0, edgeDist);

  // Compute outward normal from panel center
  vec2 panelCenter = u_panelRegion.xy + u_panelRegion.zw * 0.5;
  vec2 toEdge = normalize(uv - panelCenter);

  // Add subtle noise for organic feel
  float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);

  return toEdge * strength * u_refractionScale * 0.001 * (1.0 + noise * 0.2);
}

// Check if UV is inside panel
float inPanel(vec2 uv) {
  vec2 panelMin = u_panelRegion.xy;
  vec2 panelMax = u_panelRegion.xy + u_panelRegion.zw;

  float inX = step(panelMin.x, uv.x) * (1.0 - step(panelMax.x, uv.x));
  float inY = step(panelMin.y, uv.y) * (1.0 - step(panelMax.y, uv.y));

  return inX * inY;
}

void main() {
  vec2 uv = v_uv;
  float inside = inPanel(uv);

  if (inside < 0.5) {
    // Outside panel - pass through
    fragColor = texture(u_sceneTexture, uv);
    return;
  }

  // Compute edge-based refraction
  vec2 refraction = getRefraction(uv);

  // Chromatic aberration - separate RGB channels slightly
  float aberration = u_chromaticAberration * 0.002 * (1.0 - edgeDistance(uv));

  vec2 uvR = uv + refraction * 1.1 + vec2(aberration, 0.0);
  vec2 uvG = uv + refraction;
  vec2 uvB = uv + refraction * 0.9 - vec2(aberration, 0.0);

  // Sample with channel separation
  float r = texture(u_sceneTexture, uvR).r;
  float g = texture(u_sceneTexture, uvG).g;
  float b = texture(u_sceneTexture, uvB).b;

  vec3 color = vec3(r, g, b);

  // Add specular rim highlight
  float edgeDist = edgeDistance(uv);
  float rimStrength = pow(1.0 - edgeDist, 3.0) * u_specularIntensity;

  // Light direction based on angle
  vec2 lightDir = vec2(cos(u_lightAngle), sin(u_lightAngle));
  vec2 panelCenter = u_panelRegion.xy + u_panelRegion.zw * 0.5;
  vec2 toEdge = normalize(uv - panelCenter);
  float lightDot = max(0.0, dot(toEdge, lightDir));

  color += vec3(1.0) * rimStrength * lightDot * 0.3;

  fragColor = vec4(color, 1.0);
}
```

### Integration Points

**1. Add new shader program** in `weather-effects-canvas.tsx`:
```typescript
const GLASS_PANEL_FRAGMENT = `...`;

// In createPrograms()
programs.glassPanel = createProgram(gl, VERTEX_SHADER, GLASS_PANEL_FRAGMENT);
```

**2. Add new render pass** after snow, before final composite:
```typescript
// Glass panel pass
if (props.glassPanel?.enabled) {
  gl.useProgram(programs.glassPanel);
  gl.uniform4f(loc("u_panelRegion"), ...props.glassPanel.region);
  gl.uniform1f(loc("u_refractionScale"), props.glassPanel.refractionScale);
  gl.uniform1f(loc("u_edgeWidth"), props.glassPanel.edgeWidth);
  // ... other uniforms
  drawQuad();
  swapBuffers();
}
```

**3. Add props interface**:
```typescript
interface GlassPanelProps {
  enabled: boolean;
  region: [number, number, number, number]; // x, y, width, height
  refractionScale: number;
  edgeWidth: number;
  blurAmount: number;
  chromaticAberration: number;
  specularIntensity: number;
  lightAngle: number;
}
```

**4. Pass region from React** based on forecast element position:
```typescript
// In WeatherWidget component
const forecastRef = useRef<HTMLDivElement>(null);
const [panelRegion, setPanelRegion] = useState([0, 0, 0, 0]);

useEffect(() => {
  if (forecastRef.current && canvasRef.current) {
    const forecast = forecastRef.current.getBoundingClientRect();
    const canvas = canvasRef.current.getBoundingClientRect();

    // Convert to normalized coordinates
    setPanelRegion([
      (forecast.left - canvas.left) / canvas.width,
      (forecast.top - canvas.top) / canvas.height,
      forecast.width / canvas.width,
      forecast.height / canvas.height,
    ]);
  }
}, [/* resize dependencies */]);
```

## Files to Modify

| File | Changes |
|------|---------|
| `effects/weather-effects-canvas.tsx` | Add GLASS_PANEL_FRAGMENT shader, render pass, uniforms |
| `effects/types.ts` | Add GlassPanelProps interface |
| `effects/effect-compositor.tsx` | Pass glassPanel props through |
| `weather-widget.tsx` | Calculate forecast region, pass to canvas |

## Implementation Steps

1. **Add shader code** - Define GLASS_PANEL_FRAGMENT with edge-based displacement
2. **Add program creation** - Initialize shader program in createPrograms()
3. **Add render pass** - Insert after snow pass in render loop
4. **Add type definitions** - GlassPanelProps interface with tunable params
5. **Calculate region** - Use ResizeObserver to track forecast element bounds
6. **Wire up props** - Pass region + params from widget to canvas

## Verification

1. Open weather widget sandbox
2. Observe glass refraction at forecast panel edges
3. Background should distort/bend at edges like real glass
4. Adjust `refractionScale` - distortion intensity should change
5. Adjust `edgeWidth` - distortion should extend further/shorter from edge
6. Check different weather conditions - effect should composite correctly
7. Resize window - region should update dynamically
8. Profile in DevTools - should maintain 60fps

## Sources

- [CSS-Tricks: Making a Realistic Glass Effect with SVG](https://css-tricks.com/making-a-realistic-glass-effect-with-svg/)
- [LogRocket: Liquid Glass Effects with CSS and SVG](https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/)
- [Smashing Magazine: SVG Displacement Filtering Deep Dive](https://www.smashingmagazine.com/2021/09/deep-dive-wonderful-world-svg-displacement-filtering/)
- [MDN: feDisplacementMap](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap)
- [MDN: feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence)
