# Snow Effect Research: Physics-Based Particle Simulation

## Executive Summary

Creating realistic falling snow requires understanding **snowflake physics**, **multi-layer depth simulation**, and **wind-driven motion**. Unlike rain (which has high terminal velocity and motion blur), snow is characterized by **slow, meandering fall paths** influenced heavily by air currents. The key to realism is **variety** - varied flake sizes, speeds, rotations, and wind response across multiple depth layers.

---

## Part 1: The Physics of Falling Snow

### Snowflake Types & Visual Characteristics

| Type | Size | Appearance | Formation Temp |
|------|------|------------|----------------|
| **Stellar Dendrites** | 2-4mm | Classic 6-pointed star with branches | -15°C (5°F) |
| **Fernlike Stellar** | 3-5mm+ | Largest; leafy side-branches | -15°C |
| **Plates** | 1-3mm | Thin hexagonal, less intricate | -2°C or -15°C |
| **Columns/Needles** | 0.5-2mm | Hair-like, elongated cylinders | -6°C (21°F) |
| **Diamond Dust** | <0.5mm | Tiny sparkling particles | Extremely cold |
| **Aggregates** | 5-15mm+ | Clumped irregular masses | Variable |

> "All snowflakes contain six sides or points owing to the way in which they form... Although ice by itself is clear, snow usually appears white due to diffuse reflection of the whole spectrum of light."
> — [SnowCrystals.com Guide](https://www.snowcrystals.com/guide/guide.html)

### Terminal Velocity

Snowflakes fall **much slower** than raindrops due to their large surface area relative to mass:

| Flake Type | Terminal Velocity | Notes |
|------------|-------------------|-------|
| Small crystals (<1mm) | 0.3-0.5 m/s | Diamond dust, tiny plates |
| Medium flakes (1-3mm) | 0.5-1.0 m/s | Plates, small dendrites |
| Large dendrites (3-5mm) | 0.8-1.2 m/s | Stellar dendrites |
| Aggregates (>5mm) | 1.0-2.0 m/s | Clumped flakes, slightly faster |
| Rimed/graupel | 2.0-3.0 m/s | Ice-coated, denser |

For comparison, raindrops fall at 3-9 m/s. This slow fall speed is why wind has such a dramatic effect on snow trajectories.

> "Measurements of the terminal velocity of aggregate snowflakes indicate that the velocity is approximately proportional to the one-tenth power of the mass."
> — [Langleben Research](https://www.semanticscholar.org/paper/The-terminal-velocity-of-snowflakes-Langleben/c283a07ec6c965caa6f3b480879be178061c23dc)

### Wind Response & Drift

Due to low terminal velocity, snowflakes are highly susceptible to wind:

- **Horizontal displacement** can exceed vertical fall distance in strong winds
- **Turbulent eddies** cause erratic paths, not smooth curves
- **Particle clustering** - flakes can briefly cluster then disperse
- **Height-dependent wind** - stronger winds at higher altitudes create curved paths

The horizontal/vertical velocity ratio in a blizzard can reach 2:1 or higher.

### Motion Characteristics

Unlike rain's straight-line streaks, snowflakes exhibit:

1. **Flutter/wobble** - oscillating rotation around fall axis
2. **Spiral descent** - helical paths from asymmetric flakes
3. **Drift oscillation** - sinusoidal horizontal motion from air currents
4. **Tumbling** - random rotation for aggregates
5. **Interaction with updrafts** - briefly rising before continuing fall

---

## Part 2: Depth & Parallax Layers

### The Importance of Depth

Like the rain effect, realistic snow needs **multiple depth layers**:

| Layer | Distance | Characteristics |
|-------|----------|-----------------|
| Far background | >50m | Very small, blurry, slow parallax, minimal wind response |
| Mid-distance | 10-50m | Small flakes, moderate blur, gentle drift |
| Near | 2-10m | Sharp flakes, clear drift patterns, visible rotation |
| Foreground | <2m | Large flakes, strong wind response, possible DOF blur |

### Aerial Perspective

Distant snow appears:
- **More blue-tinted** (atmospheric scattering)
- **Lower contrast** (haze effect)
- **Slower apparent motion** (parallax)
- **Smaller** (perspective scale)

> "For highly realistic snow, using different sizes of snowflakes, different levels of blurriness, and different speeds helps recreate depth."
> — [Three.js Snow Tutorial](https://soledadpenades.com/articles/three-js-tutorials/rendering-snow-with-shaders/)

---

## Part 3: Implementation Approaches

### Approach A: GPU Point Sprites (Recommended for WebGL)

Most efficient approach - render particles as GL_POINTS with fragment shader for shape.

**Vertex Shader Pattern:**
```glsl
uniform float u_time;
uniform float u_windSpeed;
uniform float u_windAngle;
uniform float u_fallSpeed;

void main() {
  vec3 pos = position;

  // Vertical fall with modulo cycling
  pos.y = mod(pos.y - u_time * u_fallSpeed * particleSpeed, height);

  // Sinusoidal horizontal drift
  float windX = cos(u_windAngle);
  float windZ = sin(u_windAngle);
  pos.x += sin((u_time + position.z) * driftFreq) * driftAmp;
  pos.x += u_time * u_windSpeed * windX;
  pos.z += cos((u_time + position.x) * driftFreq) * driftAmp;
  pos.z += u_time * u_windSpeed * windZ;

  // Perspective-based size
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = size * (scale / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;
}
```

**Fragment Shader Pattern:**
```glsl
uniform sampler2D u_snowflakeTexture;
uniform float u_opacity;

void main() {
  // Soft circular falloff or texture lookup
  float dist = length(gl_PointCoord - vec2(0.5));
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Optional: rotate UV for flake rotation
  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * u_opacity);
}
```

### Approach B: Screen-Space Procedural (Current Sandbox Style)

Generate snowflakes procedurally in fragment shader (like current rain/cloud/lightning):

```glsl
vec2 snowLayer(vec2 uv, float scale, float speed, float time) {
  vec2 p = uv * scale;

  // Add wind drift
  p.x += time * windSpeed;
  p.y += time * speed;

  // Grid-based flake placement
  vec2 id = floor(p);
  vec2 gv = fract(p) - 0.5;

  float snow = 0.0;

  // Check neighboring cells
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      vec2 cellId = id + offs;

      // Random position within cell
      vec2 pos = hash22(cellId) - 0.5;
      vec2 localUV = gv - offs - pos;

      // Snowflake shape (soft circle or hexagonal)
      float d = length(localUV);
      float flakeSize = 0.02 + hash12(cellId) * 0.03;
      float flake = smoothstep(flakeSize, 0.0, d);

      snow += flake;
    }
  }

  return snow;
}
```

### Approach C: Hybrid (Points + Procedural)

- Use point sprites for larger, near flakes
- Use procedural noise-based fog for distant snow/atmosphere
- Combine for best of both worlds

---

## Part 4: Wind & Turbulence Simulation

### Wind Model

```glsl
vec2 windVelocity(vec2 uv, float time) {
  // Base wind direction and strength
  vec2 baseWind = vec2(cos(u_windAngle), 0.0) * u_windStrength;

  // Add turbulent gusts using noise
  float gust = fbm(uv * 2.0 + time * 0.3);
  vec2 turbulence = vec2(
    noise(uv * 3.0 + time * 0.5) - 0.5,
    noise(uv * 3.0 + time * 0.5 + 100.0) - 0.5
  ) * u_turbulence;

  return baseWind * (0.7 + gust * 0.3) + turbulence;
}
```

### Gust Patterns

For realistic blizzard conditions:
- **Low-frequency gusts** - overall wind strength variation (0.1-0.3 Hz)
- **Mid-frequency eddies** - local swirls (0.5-2 Hz)
- **High-frequency flutter** - individual flake wobble (3-10 Hz)

### Height-Dependent Wind

Wind typically increases with altitude:
```glsl
float windAtHeight = u_baseWind * (1.0 + uv.y * u_windShear);
```

---

## Part 5: Visual Polish Techniques

### Flake Appearance

**Soft Glow Approach:**
```glsl
float snowflake(float dist, float size) {
  // Sharp core
  float core = smoothstep(size * 0.5, 0.0, dist);
  // Soft glow
  float glow = exp(-dist * dist / (size * size * 2.0));
  return core + glow * 0.3;
}
```

**Six-Pointed Star (for larger flakes):**
```glsl
float hexStar(vec2 uv, float size) {
  float angle = atan(uv.y, uv.x);
  float r = length(uv);

  // 6-fold symmetry
  float star = cos(angle * 3.0) * 0.3 + 0.7;
  star = pow(star, 3.0);

  return smoothstep(size * star, 0.0, r);
}
```

### Atmospheric Effects

1. **Blue-tinted distance** - lerp toward cold blue at far layers
2. **Reduced contrast** - lower alpha variance in distant layers
3. **Subtle fog** - additive white/blue haze in heavy snow
4. **Vignette** - darker edges for cozy framing

### Accumulation Hint

While full ground accumulation is complex, a subtle hint can be achieved:
- Increase density near bottom of frame
- Add slight white gradient at very bottom
- Particles "disappear" at ground level rather than piling

---

## Part 6: Key Parameters for Sandbox

Based on the research, the snow sandbox should expose these controls:

### Flake Properties
| Parameter | Range | Description |
|-----------|-------|-------------|
| `flakeSize` | 0.5-3.0 | Base flake size multiplier |
| `sizeVariation` | 0-1 | How much flake sizes vary |
| `density` | 0.1-1.0 | Number of flakes (light to heavy) |
| `layers` | 1-6 | Depth layers for parallax |

### Motion
| Parameter | Range | Description |
|-----------|-------|-------------|
| `fallSpeed` | 0.3-2.0 | Vertical fall rate |
| `windSpeed` | 0-3.0 | Horizontal wind strength |
| `windAngle` | -π to π | Wind direction |
| `turbulence` | 0-1 | Gust/eddy intensity |
| `driftAmount` | 0-1 | Sinusoidal drift amplitude |
| `driftFrequency` | 0.5-3 | Drift oscillation speed |
| `flutter` | 0-1 | Individual flake wobble |

### Atmosphere
| Parameter | Range | Description |
|-----------|-------|-------------|
| `visibility` | 0.3-1.0 | How far you can see (fog density) |
| `skyColor` | color | Background sky tint |
| `flakeColor` | color | Flake color (usually white) |
| `glowAmount` | 0-1 | Soft glow around flakes |

### Time of Day (Optional)
| Parameter | Range | Description |
|-----------|-------|-------------|
| `sunAltitude` | -0.2 to 1 | Like cloud effect, for lighting |

---

## Part 7: Quality Checklist

For "Apple Weather" quality snow:

- [ ] Multiple depth layers (4+ recommended)
- [ ] Size variation within each layer
- [ ] Realistic slow fall speed (not like rain)
- [ ] Sinusoidal horizontal drift
- [ ] Wind affects all layers (parallax amount varies)
- [ ] Turbulent gusts in heavy snow mode
- [ ] Soft, glowing flake appearance
- [ ] Blue-tinted distant layers (aerial perspective)
- [ ] Smooth 60fps performance
- [ ] No visible grid artifacts in procedural approach

---

## Part 8: Presets

| Preset | Settings |
|--------|----------|
| **Gentle Flurries** | density: 0.2, fallSpeed: 0.4, wind: 0.2, turbulence: 0.1 |
| **Steady Snow** | density: 0.5, fallSpeed: 0.6, wind: 0.5, turbulence: 0.3 |
| **Heavy Snowfall** | density: 0.8, fallSpeed: 0.8, wind: 0.8, turbulence: 0.5 |
| **Blizzard** | density: 1.0, fallSpeed: 1.0, wind: 2.5, turbulence: 0.9, visibility: 0.4 |
| **Night Snow** | density: 0.4, sunAltitude: -0.1, skyColor: dark blue |

---

## Sources

### Physics & Research
- [SnowCrystals.com: Guide to Snowflakes](https://www.snowcrystals.com/guide/guide.html)
- [Langleben: Terminal Velocity of Snowflakes](https://www.semanticscholar.org/paper/The-terminal-velocity-of-snowflakes-Langleben/c283a07ec6c965caa6f3b480879be178061c23dc)
- [UBC: Snow Crystal Habits](https://www.eoas.ubc.ca/courses/atsc113/snow/met_concepts/07-met_concepts/07kl-snow-crystal-habits/)
- [Wiley: Snow and Ice Animation Methods 2024](https://onlinelibrary.wiley.com/doi/10.1111/cgf.15059)

### Implementation Tutorials
- [Soledad Penadés: Rendering Snow with Shaders](https://soledadpenades.com/articles/three-js-tutorials/rendering-snow-with-shaders/)
- [GPU-Accelerated Particles with WebGL 2](https://gpfault.net/posts/webgl2-particles.txt.html)
- [Shadertoy Particle Algorithm Overview](https://michaelmoroz.github.io/TODO/2021-3-13-Overview-of-Shadertoy-particle-algorithms/)
- [Unity Geometry Shader Rain/Snow](https://medium.com/@andresgomezjr89/rain-snow-with-geometry-shaders-in-unity-83a757b767c1)

### Tools & Assets
- [Three.js Snowfall Demo](https://threejsdemos.com/demos/particles/snow)
- [Godot Rain/Snow Parallax Shader](https://steampunkdemon.itch.io/rain-and-snow-shader-with-parallax-effect-for-godot)
- [Disney Matterhorn Snow Simulator](https://www.disneyanimation.com/technology/matterhorn/)
