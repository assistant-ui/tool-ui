# Atmospheric Lighting Research: Realistic Sunrise/Sunset Effects

## Executive Summary

Realistic sky coloring requires simulating **Rayleigh scattering** (blue sky) and **Mie scattering** (haze/glow). At sunrise/sunset, light travels through more atmosphere, scattering away blue wavelengths and leaving warm orange/red. Clouds become dramatically lit from below with warm colors during golden hour.

---

## Part 1: The Physics

### Rayleigh Scattering (Why the Sky is Blue)

Caused by air molecules scattering light. **Shorter wavelengths scatter more** (λ⁻⁴ relationship):
- Blue light (~440nm) scatters ~10x more than red (~680nm)
- At midday: short path through atmosphere → blue light scattered toward viewer
- At sunset: long path → blue scattered away, only red/orange remains

**Sea-level scattering coefficients:**
```
Blue:  33.1e-6 m⁻¹
Green: 13.5e-6 m⁻¹
Red:   5.8e-6 m⁻¹
```

### Mie Scattering (Haze and Sun Glow)

Caused by larger particles (dust, water droplets, pollution):
- Scatters **all wavelengths equally** → white/grey haze
- Strong **forward scattering** → creates bright glow around sun
- More prominent at sunrise/sunset due to longer path through aerosols

**Anisotropy factor (g):** ~0.76 (strong forward preference)

### Why Sunsets Are Orange/Red

| Sun Position | Path Length | Result |
|--------------|-------------|--------|
| Zenith (noon) | Short (~1 atmosphere) | Blue sky, white sunlight |
| 20° altitude | Medium | Warm yellow light |
| 5° (golden hour) | Long (~10 atmospheres) | Orange light, pink clouds |
| 0° (horizon) | Very long (~40 atmospheres) | Deep red/orange |
| Below horizon | Indirect only | Purple/blue twilight |

---

## Part 2: Time-of-Day Color Phases

### 1. Night (Sun < -18°)
- Sky: Deep navy/black `rgb(10, 15, 30)`
- No direct sunlight

### 2. Astronomical Twilight (-18° to -12°)
- Sky: Deep blue-purple
- Horizon: Faint warm glow beginning

### 3. Nautical Twilight (-12° to -6°)
- Sky: Purple to blue gradient
- Horizon: Orange/pink band developing

### 4. Civil Twilight / Blue Hour (-6° to 0°)
- Sky: Rich blue `rgb(25, 50, 100)` to `rgb(70, 100, 150)`
- Horizon: Strong orange/pink band
- Clouds: Dramatic undersides lit pink/orange

### 5. Golden Hour (0° to 6°)
- Sky: Gradient from warm orange near horizon to blue above
- Sunlight: ~2700-3500K color temperature (warm orange)
- Clouds: Brilliantly lit with warm colors, long shadows

### 6. Day (Sun > 6°)
- Sky: Blue gradient `rgb(135, 180, 230)` to `rgb(60, 120, 190)`
- Sunlight: ~5500-6500K (neutral white)
- Clouds: White tops, grey shadows

---

## Part 3: Color Palettes

### Sunrise Palette (sun altitude 0-10°)
```
Horizon:  #FF6B35 (Outrageous Orange)
Low sky:  #F7931E (Carrot Orange)
Mid sky:  #FFB347 (Pastel Orange)
Upper:    #87CEEB (Light Sky Blue)
Zenith:   #4A90D9 (Celestial Blue)
```

### Sunset Palette (sun altitude 0-10°)
```
Horizon:  #FF4500 (Orange Red)
Low sky:  #FF6347 (Tomato)
Mid sky:  #FF7F50 (Coral)
Band:     #DDA0DD (Plum) - purple band above orange
Upper:    #483D8B (Dark Slate Blue)
Zenith:   #191970 (Midnight Blue)
```

### Golden Hour Cloud Colors
```
Lit faces:     #FFD700 (Gold) to #FF8C00 (Dark Orange)
Highlights:    #FFFACD (Lemon Chiffon)
Shadows:       #8B4513 (Saddle Brown) to #4A2C2A (Deep Brown)
Rim lighting:  #FF69B4 (Hot Pink) - from scattered sunset light
```

---

## Part 4: Implementation Approaches

### Option A: Full Atmospheric Scattering (Complex)

Ray march through atmosphere computing Rayleigh + Mie integrals:

```glsl
vec3 atmosphere(vec3 rayDir, vec3 sunPos, float sunAlt) {
  // 16 samples along view ray
  // 8 samples toward sun at each point
  // Integrate scattering coefficients
  // Apply phase functions
  return rayleigh + mie;
}
```

**Pros:** Physically accurate, handles all cases
**Cons:** Expensive (many samples), complex to tune

### Option B: Simplified Gradient Interpolation (Recommended)

Pre-define color gradients for key sun positions, interpolate between them:

```glsl
vec3 skyColor(vec2 uv, float sunAlt) {
  // Define gradients for night, twilight, golden hour, day
  vec3 nightSky = mix(deepBlue, navy, uv.y);
  vec3 goldenSky = mix(orange, blue, pow(uv.y, 0.5));
  vec3 daySky = mix(lightBlue, deepBlue, uv.y);

  // Interpolate based on sun altitude
  float t = smoothstep(-0.1, 0.3, sunAlt);
  return mix(nightSky, mix(goldenSky, daySky, t), t);
}
```

**Pros:** Fast, easy to art-direct, predictable
**Cons:** Less physically accurate, needs manual tuning

### Option C: Hybrid (Best Balance)

Use simplified gradients for sky, but add physics-inspired effects:

1. **Sun glow** - Mie-like forward scattering near sun position
2. **Horizon band** - Extra warmth at low altitudes
3. **Cloud tinting** - Warm colors when sun is low
4. **Adaptive shadows** - Warmer, softer shadows at golden hour

---

## Part 5: Cloud Lighting Adjustments

### Key Principles

1. **Sun altitude affects cloud color temperature**
   - High sun: Neutral white highlights, cool grey shadows
   - Low sun: Warm orange/gold highlights, warm brown shadows

2. **Underside illumination at sunset**
   - Clouds lit from below when sun is at/below horizon
   - Creates dramatic "on fire" effect

3. **Rim lighting / silver lining**
   - Forward-scattered light creates bright edges
   - More pronounced at sunset (longer path = more scattering)

4. **Shadow color shift**
   - Daytime shadows: Cool blue-grey (sky fill light)
   - Sunset shadows: Warm purple-brown (less fill, warm ambient)

### Implementation for Cloud Shader

```glsl
vec3 cloudLighting(float density, float height, float sunAlt) {
  // Base colors shift with sun altitude
  float warmth = 1.0 - smoothstep(0.0, 0.5, sunAlt);

  // Lit color: white → orange as sun lowers
  vec3 litColor = mix(
    vec3(1.0, 0.98, 0.95),  // Daylight white
    vec3(1.0, 0.6, 0.3),    // Sunset orange
    warmth
  );

  // Shadow color: cool grey → warm brown
  vec3 shadowColor = mix(
    vec3(0.5, 0.55, 0.65),  // Cool shadow
    vec3(0.4, 0.25, 0.2),   // Warm shadow
    warmth
  );

  // At very low sun, light comes from below
  float bottomLight = smoothstep(0.1, -0.1, sunAlt) * (1.0 - height);

  return mix(shadowColor, litColor, lightAmount + bottomLight);
}
```

---

## Part 6: Recommended Changes to Cloud Shader

1. **Replace fixed sky colors** with sun-altitude-based gradient
2. **Add warmth parameter** to cloud lighting based on sun altitude
3. **Shift shadow colors** from cool to warm as sun lowers
4. **Add horizon glow** effect when sun is low
5. **Optional: Sun disc** rendered at sun position with Mie glow

### New Uniforms Needed
```glsl
uniform float u_sunAltitude;  // -1 to 1 (below horizon to zenith)
uniform vec3 u_sunDirection;  // For positioning sun glow (optional)
```

### Sky Gradient Function
```glsl
vec3 atmosphericSky(vec2 uv, float sunAlt) {
  // Night colors
  vec3 nightTop = vec3(0.02, 0.03, 0.08);
  vec3 nightBot = vec3(0.05, 0.05, 0.12);

  // Sunset/sunrise colors
  vec3 sunsetTop = vec3(0.2, 0.3, 0.6);
  vec3 sunsetMid = vec3(0.8, 0.4, 0.5);
  vec3 sunsetBot = vec3(1.0, 0.5, 0.2);

  // Day colors
  vec3 dayTop = vec3(0.3, 0.5, 0.85);
  vec3 dayBot = vec3(0.6, 0.75, 0.95);

  // Blend based on sun altitude
  float dayFactor = smoothstep(-0.1, 0.3, sunAlt);
  float sunsetFactor = smoothstep(-0.2, 0.0, sunAlt) * (1.0 - smoothstep(0.1, 0.3, sunAlt));

  vec3 top = mix(nightTop, mix(sunsetTop, dayTop, dayFactor), dayFactor + sunsetFactor);
  vec3 bot = mix(nightBot, mix(sunsetBot, dayBot, dayFactor), dayFactor + sunsetFactor);

  // Add extra warmth at horizon during sunset
  vec3 horizonGlow = vec3(1.0, 0.4, 0.1) * sunsetFactor * pow(1.0 - uv.y, 4.0);

  return mix(bot, top, uv.y) + horizonGlow;
}
```

---

## Sources

### Physics & Theory
- [NVIDIA GPU Gems 2 - Accurate Atmospheric Scattering](https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-16-accurate-atmospheric-scattering)
- [Scratchapixel - Simulating the Colors of the Sky](https://www.scratchapixel.com/lessons/procedural-generation-virtual-worlds/simulating-sky/simulating-colors-of-the-sky.html)

### Implementations
- [glsl-atmosphere - Rayleigh/Mie scattering](https://github.com/wwwtyro/glsl-atmosphere)
- [Shadertoy - Atmospheric scattering explained](https://www.shadertoy.com/view/wlBXWK)
- [SkyShader - Day/night cycle](https://github.com/clara-nolan/SkyShader)

### Color & Photography
- [PhotoPills - Mastering Golden Hour](https://www.photopills.com/articles/mastering-golden-hour-blue-hour-magic-hours-and-twilights)
- [Wikipedia - Golden hour](https://en.wikipedia.org/wiki/Golden_hour_(photography))
- [Wikipedia - Color temperature](https://en.wikipedia.org/wiki/Color_temperature)

### Color Palettes
- [SchemeColor - Sunrise Sky Gradient](https://www.schemecolor.com/sunrise-sky-gradient.php)
- [SchemeColor - Sunset Sky Gradient](https://www.schemecolor.com/sunset-sky-gradient.php)
