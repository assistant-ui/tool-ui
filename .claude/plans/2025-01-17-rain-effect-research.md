# Rain Effect Research: Achieving Apple-Quality Realism

## Executive Summary

Creating truly realistic rain requires understanding both the **physics of real rain** and the **rendering techniques** that simulate it. The gold standard implementations use WebGL shaders with multi-layer compositing, but impressive results can be achieved with CSS for simpler scenarios.

---

## Part 1: What Makes Rain Look Real (CG Principles)

### Motion Blur is Everything

Real raindrops are **spherical**, not streaky. The "streak" appearance comes entirely from:
- **Camera shutter time** (motion blur)
- **Retinal persistence** in our eyes

> "The drop itself has not changed its spherical shape... the long streak is caused by motion blurring."
> — [Microsoft Research: Real-Time Rendering of Realistic Rain](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/RealTimeRain_MSTR.pdf)

**Implication:** Pre-blur raindrop textures or use motion blur shaders rather than drawing elongated shapes.

### Depth Creates Believability

Professional implementations use **4+ layers of rain** at different depths:

| Layer | Distance | Characteristics |
|-------|----------|-----------------|
| Far background | 50m+ | Misty, nearly invisible, slow parallax |
| Mid-distance | 10-50m | Faint streaks, moderate blur |
| Near | 2-10m | Sharp streaks, visible refraction |
| Foreground | <2m | Large drops, strong motion blur, splash potential |

Each layer has different:
- Fall speeds (3-9 m/s based on drop size 1-4mm)
- Focus/blur amounts
- Opacity levels
- Parallax speeds

### Physical Drop Properties

| Drop Size | Terminal Velocity | Visual Appearance |
|-----------|-------------------|-------------------|
| 1mm (drizzle) | ~3 m/s | Fine, misty |
| 2mm (light rain) | ~5 m/s | Moderate streaks |
| 3mm (moderate) | ~7 m/s | Clear streaks |
| 4mm+ (heavy) | ~9 m/s | Large, visible drops |

**Key insight:** Raindrops oscillate as they fall, causing complex brightness patterns within motion-blurred streaks due to changing refraction angles.

### Lighting Interactions

Rain becomes visible primarily through:
1. **Specular highlights** — catching light sources
2. **Refraction** — distorting background through each drop
3. **Atmospheric scattering** — fog/mist effect in heavy rain
4. **Halation** — misty glow around light sources

> "Rain drops are often difficult to see but become highly visible when reflecting or catching the light."
> — [FXGuide: Game Environments - Rain](https://www.fxguide.com/fxfeatured/game-environments-partb/)

---

## Part 2: Implementation Approaches (Ranked by Realism)

### Tier 1: WebGL Shader-Based (Highest Quality)

**Best-in-class example:** [Shadertoy "Heartfelt" by BigWings](https://www.shadertoy.com/view/ltffzl)
- Called "the most beautiful thing I've ever seen on this website"
- No feedback buffers needed
- Procedural generation in fragment shader

**Key techniques:**

#### Grid-Based Drop Generation
```glsl
// Divide UV space into cells, each containing one potential drop
vec2 cellUV = fract(uv * gridSize);
vec2 cellID = floor(uv * gridSize);
float random = hash(cellID); // Determines if this cell has a drop
```

#### Refraction via Normal Mapping
```glsl
// Calculate surface normal of drop
vec3 normal = normalize(vec3(cos(p), mix(.2, 2., t-.5), 1.0));
// Offset texture lookup for refraction effect
vec2 distortedUV = uv - normal.xy * 0.3;
vec4 refractedColor = texture(background, distortedUV);
```

#### Drop Shape Function
```glsl
// Teardrop shape: circular at bottom, tapered at top
float drop = smoothstep(0.0, radius, length(uv - center));
drop *= smoothstep(0.0, 0.1, uv.y - center.y + radius); // Taper top
```

**Libraries:**
- [RaindropFX](https://github.com/SardineFish/raindrop-fx) — WebGL2, ~6ms/frame for 2000 drops
- [Codrops RainEffect](https://github.com/codrops/RainEffect) — WebGL with dual-canvas system

### Tier 2: Canvas 2D + Compositing (Good Quality)

**Approach from [Codrops Rain & Water Experiments](https://tympanus.net/codrops/2015/11/04/rain-water-effect-experiments/):**

1. **Separate large/small drops** — Large drops are animated, small are static
2. **Composite operations** — Large drops "erase" small drops beneath them
3. **Two-texture system:**
   - Low-res blurred background (cheap to sample)
   - High-res foreground through drops only
4. **Color-channel normal encoding:**
   - Red channel = Y-position offset
   - Green channel = X-position offset
   - Creates pseudo-refraction without true ray tracing

**Performance:** Exponential complexity avoided by separating drop systems.

### Tier 3: Three.js Points (Medium Quality, Simple)

**From [Red Stapler Tutorial](https://redstapler.co/three-js-realistic-rain-tutorial/):**

```javascript
// Single geometry with 15,000 vertices (one per drop)
const rainGeo = new THREE.BufferGeometry();
const positions = new Float32Array(rainCount * 3);

for (let i = 0; i < rainCount; i++) {
  positions[i * 3] = Math.random() * 400 - 200;     // x
  positions[i * 3 + 1] = Math.random() * 500 - 250; // y
  positions[i * 3 + 2] = Math.random() * 400 - 200; // z
}

rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Point material with transparency
const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.1,
  transparent: true
});
```

**Pros:** Simple, decent performance
**Cons:** No refraction, limited realism

### Tier 4: Pure CSS (Lowest Complexity, Stylized)

**Techniques:**

1. **Keyframe animation on div elements:**
```css
.raindrop {
  animation: fall 0.68s linear infinite;
  background: linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.8));
}

@keyframes fall {
  0% { margin-top: -100px; }
  100% { margin-top: 700px; }
}
```

2. **SVG raindrops with CSS animation** — Better shape control
3. **CSS variables for randomization** — [jh3y's CodePen approach](https://codepen.io/jh3y/pen/WyNdMG)

**Best CSS example:** [Pure CSS Rain by Yannick Brandt](https://armory.visualsoldiers.com/pure-css-rain/)

**Pros:** No JS, great performance, works everywhere
**Cons:** No refraction, limited depth simulation, stylized appearance

---

## Part 3: Specific Techniques for Maximum Realism

### 1. Raindrop-on-Glass Effect

The [Shadertoy "Rain drops on screen"](https://www.shadertoy.com/view/ldSBWW) effect achieves realism through:

- **Grid quantization** for consistent drop spacing
- **Sinusoidal shaping** (`sin(6.28 * u * x + noise)`) for drop silhouettes
- **Temporal animation** with gradual evaporation
- **Probability culling** — not every grid cell gets a drop

### 2. Ripple Effects (for puddles/surfaces)

From [Cyanilux's breakdown](https://www.cyanilux.com/tutorials/rain-effects-breakdown/):

```hlsl
// Voronoi-style ripple generation
float ripple(vec2 uv, float time) {
  vec2 cell = floor(uv);
  vec2 cellUV = fract(uv);

  float minDist = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(x, y);
      vec2 point = random2(cell + neighbor);
      float d = length(cellUV - neighbor - point);
      minDist = min(minDist, d);
    }
  }

  // Ripple wave with falloff
  float t = fract(time + random(cell));
  return pow(saturate(1.0 - abs(minDist - t)), 8) * sin((minDist - t) * 30.0);
}
```

### 3. Trail Effects

Large drops leave smaller droplet trails. Implementation:

1. Track large drop positions over time
2. Spawn small static drops along path
3. Small drops slowly evaporate (shrink over time)
4. Use `globalCompositeOperation = 'destination-out'` to clear trails when new large drops pass

### 4. The "4000 Particle Rule"

> "At least 4000 particles are needed to produce a realistic impression of rain."
> — Academic research on rain rendering

For a small widget, scale proportionally: ~100-400 particles for a 400×300 viewport.

---

## Part 4: Apple Weather App Insights

Apple's Weather app (iOS 15+) features:

- **Thousands of variations** in background animations
- **Time-of-day awareness** — darker at night, brighter during day
- **Physical interaction** — rain/snow "hits" the info card edges
- **Layered depth** — multiple particle layers at different speeds
- **Performance gating** — only iPhone XS+ can run animations (GPU requirements)

The key Apple polish factors:
1. Particles interact with UI elements (not just background)
2. Smooth 60fps regardless of particle count
3. Subtle lighting changes based on conditions
4. Sound design synchronized with visuals

---

## Part 5: Recommended Approach for Weather Widget

### Phase 1: Sandbox Development

Create an isolated development environment:
```
components/tool-ui/weather-widget/effects/
  rain/
    sandbox.html        # Standalone test page
    rain-effect.tsx     # React component wrapper
    rain-shader.glsl    # WebGL shader (if using)
    rain.css            # CSS-only fallback
```

### Phase 2: Layered Architecture

```
┌─────────────────────────────────┐
│ UI Layer (text, icons)          │ z-index: 3
├─────────────────────────────────┤
│ Foreground Rain (sharp, fast)   │ z-index: 2
├─────────────────────────────────┤
│ Background Rain (blurry, slow)  │ z-index: 1
├─────────────────────────────────┤
│ Atmospheric Layer (mist/fog)    │ z-index: 0
└─────────────────────────────────┘
```

### Phase 3: Progressive Enhancement

| Capability | Implementation |
|------------|----------------|
| Baseline | CSS animation (works everywhere) |
| Enhanced | Canvas 2D particles |
| Premium | WebGL shader with refraction |

Detect capabilities and serve appropriate version.

### Quality Checklist for "Apple-Level" Rain

- [ ] Multiple depth layers (3-4 minimum)
- [ ] Motion blur on drops (not elongated shapes)
- [ ] Variable drop sizes within each layer
- [ ] Subtle refraction/distortion effect
- [ ] Drops interact with UI boundaries
- [ ] Atmospheric haze in heavy rain
- [ ] Smooth 60fps on target devices
- [ ] Graceful degradation on low-end devices

---

---

## Part 6: Additional Insights (From Supplemental Research)

### Raindrop Oscillation Creates Internal Streak Texture

A critical detail for maximum realism: motion-blurred rain streaks are **not uniform gradients**. Due to shape oscillations from aerodynamic forces and surface tension, each streak contains:

- **Speckles** — bright point variations
- **Multiple smeared highlights** — several brightness peaks
- **Curved brightness contours** — non-linear patterns

> "This pattern is highly complex because of shape distortions that the raindrop undergoes as it falls."
> — [Columbia University Research](https://cave.cs.columbia.edu/old/publications/pdfs/Garg_TOG06.pdf)

**Implication:** Our streak textures should have internal variation, not just a simple linear gradient.

### The Four Components of Complete Rain

| Component | Description | Priority |
|-----------|-------------|----------|
| **Rain Streaks** | Motion-blurred falling drops | Phase 1 |
| **Splashes & Ripples** | Impact effects on surfaces | Phase 2 |
| **Wet Surfaces** | Changed material properties (darker, more reflective) | Phase 3 |
| **Atmospheric Effects** | Fog, mist, reduced visibility | Phase 4 |

### ATI SIGGRAPH 2006: The Foundation Paper

[Tatarchuk's "Artist-Directable Real-Time Rain"](https://advances.realtimerendering.com/s2006/Tatarchuk-Rain.pdf) established the hybrid approach used in games today:

1. **Image-space rainfall** — Screen-space rain overlay (efficient)
2. **Particle-based drips/splashes** — For close interactions
3. **Water surface ripple simulation** — Procedural normal maps
4. **Droplets on glass** — Animated trickling paths
5. **View-dependent reflections** — Wet surface warping

Key constraint: The entire ToyShop demo fit in **<256MB VRAM** while targeting 2006 hardware. Modern implementations can do far more.

### Lightning Integration

Lightning should be treated as a **strong directional light** affecting all rain particles. The rain must "respond dynamically and correctly to lighting changes"—meaning rain visibility spikes dramatically during lightning flashes.

---

## Sources

### Research Papers
- [Microsoft: Real-Time Rendering of Realistic Rain](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/RealTimeRain_MSTR.pdf)
- [Columbia: Photorealistic Rendering of Rain Streaks](https://www.cs.columbia.edu/CAVE/publications/pdfs/Garg_TOG06.pdf)
- [ATI: Artist-Directable Real-Time Rain (SIGGRAPH 2006)](https://advances.realtimerendering.com/s2006/Tatarchuk-Rain.pdf)

### Best Implementations
- [Shadertoy "Heartfelt" (ltffzl)](https://www.shadertoy.com/view/ltffzl) — Considered the gold standard
- [Shadertoy "Rain drops on screen"](https://www.shadertoy.com/view/ldSBWW) — Well-documented
- [Codrops Rain Effect](https://tympanus.net/codrops/2015/11/04/rain-water-effect-experiments/)
- [RaindropFX Library](https://github.com/SardineFish/raindrop-fx)

### Tutorials
- [Greentec: Shadertoy Rain Drops Analysis](https://greentec.github.io/rain-drops-en/)
- [Cyanilux: Rain Effects Breakdown](https://www.cyanilux.com/tutorials/rain-effects-breakdown/)
- [Red Stapler: Three.js Rain](https://redstapler.co/three-js-realistic-rain-tutorial/)

### CSS Collections
- [FreeFrontend: CSS Rain Effects](https://freefrontend.com/css-rain/)
- [jh3y: Pure CSS Rain with SVG](https://codepen.io/jh3y/pen/WyNdMG)
