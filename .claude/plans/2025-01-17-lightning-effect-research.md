# Lightning Effect Research: Physics-Based Simulation

## Executive Summary

Creating realistic lightning requires understanding both the **physics of electrical discharge** and the **algorithms that simulate it**. The gold standard is the **Dielectric Breakdown Model (DBM)**, which solves Laplace's equation to model electric field propagation. Simpler approaches use **Diffusion-Limited Aggregation (DLA)** or **fractal noise**.

---

## Part 1: The Physics of Lightning

### How Real Lightning Forms

Lightning occurs in distinct phases:

1. **Stepped Leader** - An invisible ionized channel descends from the cloud in discrete steps (~50m each), branching as it goes. This is the fractal structure we see.

2. **Attachment Process** - When the leader approaches ground, upward streamers rise to meet it.

3. **Return Stroke** - The brilliant flash we see. Current flows upward at ~1/3 the speed of light, heating the channel to ~30,000K.

### Key Physical Properties

| Property | Value | Implication for Rendering |
|----------|-------|---------------------------|
| Return stroke speed | 1.0-1.3 × 10⁸ m/s | Near-instantaneous illumination |
| Channel temperature | ~30,000K | Brilliant blue-white core |
| Channel diameter | 2-5 cm (core) | Very thin main channel |
| Branching angle | 15-30° typical | Natural branching pattern |
| Luminosity decay | Exponential | Branches dimmer than main channel |

### Luminosity Characteristics

From research at University of Florida:
- **Peak current ∝ √(peak luminosity)**: `I_peak = 21.89 × L_peak^0.57`
- Channel brightness is **greater when current is increasing** than decreasing
- **3% current loss** from top to bottom of channel (affects brightness gradient)
- Brightness at branches decays with distance from main channel

> "The return stroke is the optically brightest process in cloud-to-ground lightning."

---

## Part 2: The Dielectric Breakdown Model (DBM)

### Core Concept

The DBM simulates how electrical discharge propagates through a medium by:
1. Solving for the **electric potential field** (Laplace's equation)
2. Growing the discharge **probabilistically** based on field strength
3. Creating **branching** through stochastic selection

### Algorithm (from Kim & Lin, UNC)

```
1. Initialize grid with:
   - Source electrode (cloud) at potential φ₀
   - Ground electrode at potential φ₁
   - Empty cells at intermediate potential

2. Solve discrete Laplace equation:
   φ[i,j] = ¼(φ[i-1,j] + φ[i+1,j] + φ[i,j-1] + φ[i,j+1])

   Iterate until convergence (SOR method recommended)

3. For each growth step:
   a. Find all candidate cells (adjacent to existing discharge)
   b. Calculate breakdown probability for each:
      P(cell) = φ(cell)^η / Σ(φ(candidates)^η)
   c. Select one cell randomly according to P
   d. Add selected cell to discharge structure
   e. Re-solve Laplace equation with new boundary

4. Repeat until ground is reached
```

### The η (Eta) Parameter

The exponent η controls **branching density**:
- **η = 1**: Dense branching (bushy appearance)
- **η = 2-4**: Moderate branching (realistic lightning)
- **η > 4**: Sparse branching (sparse, directed bolts)

### Computational Cost

The expensive part is solving Laplace's equation at each step. For real-time:
- **Full DBM**: Too slow (O(n²) per step × n steps)
- **Fast DBM**: Use distance approximation instead of solving Laplace
- **Pre-computed**: Generate paths offline, animate at runtime

---

## Part 3: Simplified Approaches

### Distance-Based Approximation (Lo-Fi Lightning)

From Game Developer article - avoids Laplace equation entirely:

```
probability(cell) = exp(-d(cell, target))
```

Where `d` is Euclidean distance to target. Cells closer to target have higher probability, but branching still occurs naturally.

**Pseudocode:**
```
1. Choose source S and target T cells
2. Initialize bolt B = {S}
3. While T not in B:
   a. Find all cells adjacent to B
   b. For each candidate C:
      P(C) = exp(-distance(C, T))
   c. Normalize probabilities
   d. Select one cell weighted by P
   e. Add to B
4. Render B
```

### Diffusion-Limited Aggregation (DLA)

Simpler than DBM but produces similar fractal patterns:
1. Fix a seed point
2. Release random walkers from far away
3. When a walker touches the structure, it sticks
4. Repeat

**Pros**: Simple, naturally fractal
**Cons**: Less control over direction, slower to reach target

### L-System / Recursive Branching

Fast but less physically accurate:
```
function branch(start, end, depth):
  if depth == 0: return

  // Main segment with displacement
  mid = lerp(start, end, 0.5) + randomOffset()
  drawLine(start, mid)
  drawLine(mid, end)

  // Recursive branches
  if random() < branchProbability:
    branchEnd = mid + randomDirection() * length * 0.6
    branch(mid, branchEnd, depth - 1)

  branch(start, mid, depth - 1)
  branch(mid, end, depth - 1)
```

---

## Part 4: Rendering Techniques

### Channel Appearance

Lightning channels have distinct visual layers:
1. **Core**: Brilliant white, very thin (1-2 pixels at typical scale)
2. **Inner glow**: Blue-white, ~4x core width
3. **Outer glow**: Purple/blue, diffuse, ~10x core width
4. **Bloom**: HDR overflow effect

### Glow Implementation

**Multi-pass approach:**
1. Render lightning to separate buffer
2. Apply Gaussian blur (7x7 or larger kernel)
3. Composite: `final = sharp + blurred * glowIntensity`

**Single-pass shader approach:**
```glsl
float glow(vec2 uv, vec2 lineStart, vec2 lineEnd) {
  float d = distanceToLine(uv, lineStart, lineEnd);

  // Core
  float core = smoothstep(coreWidth, 0.0, d);

  // Inner glow (exponential falloff)
  float inner = exp(-d * innerFalloff);

  // Outer glow (softer falloff)
  float outer = exp(-d * d * outerFalloff);

  return core + inner * 0.5 + outer * 0.2;
}
```

### Brightness Variation

For realism, vary brightness along the channel:
- **Main channel**: Brightest
- **Primary branches**: 60-80% brightness
- **Secondary branches**: 30-50% brightness
- **Tertiary**: 10-20% brightness

Also vary over time:
- **Initial flash**: 100% brightness, ~50ms
- **Sustained**: 30-50% brightness, ~100ms
- **Decay**: Exponential falloff

### Animation

Lightning has distinct temporal phases:
1. **Leader propagation**: 1-20ms (can show growing)
2. **Return stroke**: <1ms (instant flash)
3. **Continuing current**: 50-200ms (sustained glow)
4. **Subsequent strokes**: Can repeat 3-4 times

For weather effects, the return stroke (instant flash) is most important.

---

## Part 5: Implementation Recommendations

### For Real-Time WebGL

**Option A: Pre-computed Paths + Animated Rendering**
1. Generate paths using DBM/DLA offline or on init
2. Store as vertex data or texture
3. Animate brightness/glow in shader
4. Regenerate occasionally for variety

**Option B: Simplified GPU Generation**
1. Use recursive midpoint displacement in shader
2. Add noise-based branching
3. Render with glow in single pass

**Option C: Hybrid**
1. Generate main channel path on CPU (DBM-lite)
2. Add detail branches procedurally in shader
3. Render with multi-layer glow

### Shader Structure for Lightning

```glsl
// Uniforms
uniform float u_time;
uniform float u_flashIntensity;
uniform vec2 u_boltStart;
uniform vec2 u_boltEnd;

// Generate displaced path using noise
vec2 displacedPoint(vec2 start, vec2 end, float t, float seed) {
  vec2 base = mix(start, end, t);
  float noise = fbm(vec2(t * 10.0, seed)) * 2.0 - 1.0;
  vec2 normal = normalize(vec2(-(end.y - start.y), end.x - start.x));
  return base + normal * noise * displacement * (1.0 - abs(t - 0.5) * 2.0);
}

// Distance to lightning path
float lightningDist(vec2 uv) {
  float minDist = 999.0;
  vec2 prev = u_boltStart;

  for (int i = 1; i <= SEGMENTS; i++) {
    float t = float(i) / float(SEGMENTS);
    vec2 curr = displacedPoint(u_boltStart, u_boltEnd, t, 0.0);
    minDist = min(minDist, distToSegment(uv, prev, curr));
    prev = curr;
  }

  return minDist;
}

// Main
void main() {
  float d = lightningDist(v_uv);

  // Multi-layer glow
  float core = smoothstep(0.002, 0.0, d);
  float glow = exp(-d * 200.0);
  float bloom = exp(-d * d * 1000.0);

  vec3 color = vec3(0.9, 0.95, 1.0) * core;
  color += vec3(0.6, 0.7, 1.0) * glow;
  color += vec3(0.4, 0.5, 0.8) * bloom;

  color *= u_flashIntensity;

  fragColor = vec4(color, 1.0);
}
```

---

## Part 6: Quality Checklist

For "Apple-level" lightning realism:

- [ ] Fractal branching structure (not random zigzags)
- [ ] Main channel significantly brighter than branches
- [ ] Branch brightness decreases with distance from main
- [ ] Proper glow layers (core, inner, outer, bloom)
- [ ] Blue-white core, purple-blue glow
- [ ] Temporal phases (flash, sustain, decay)
- [ ] Occasional re-strikes (2-4 flashes per bolt)
- [ ] Illuminates entire scene briefly
- [ ] Accompanied by environmental response (rain brightens)

---

## Sources

### Academic Papers
- [Kim & Lin: Physically Based Animation and Rendering of Lightning](http://gamma.cs.unc.edu/LIGHTNING/) (UNC, Pacific Graphics 2004)
- [Syssoev et al: Numerical Simulation of Stepping and Branching](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2019JD031360) (JGR 2020)
- [Carvalho et al: Return Stroke Luminosity](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2018JD028644) (JGR 2018)

### Implementations
- [chromia/lichtenberg](https://github.com/chromia/lichtenberg) - C++/Python DBM, Fast DBM, DLA
- [profConradi/Dielectric_Breakdown.ipynb](https://github.com/profConradi/Python_Simulations/blob/main/Dielectric_Breakdown.ipynb) - Python implementation
- [epa058/Lichtenberg-Figures](https://github.com/epa058/Lichtenberg-Figures) - DBM with stochastic nature

### Tutorials
- [Game Developer: Rendering Lo-Fi Lightning](https://www.gamedeveloper.com/programming/rendering-lo-fi-lightning)
- [LearnOpenGL: Bloom](https://learnopengl.com/Advanced-Lighting/Bloom)
- [Wikipedia: Lichtenberg Figure](https://en.wikipedia.org/wiki/Lichtenberg_figure)
- [Wikipedia: Diffusion-Limited Aggregation](https://en.wikipedia.org/wiki/Diffusion-limited_aggregation)
