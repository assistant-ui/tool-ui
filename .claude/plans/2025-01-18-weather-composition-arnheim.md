# Weather Widget Composition: Arnheim Analysis

## Chrome Structure

```
┌─────────────────────────────────────┐
│ Location                            │  ← TOP-LEFT ANCHOR
├─────────────────────────────────────┤
│  ┌────┐                             │
│  │icon│  72°  ← DOMINANT WEIGHT     │  ← LEFT-CENTER MASS
│  └────┘  Clear · H:78° L:65°        │
├─────────────────────────────────────┤
│  Mon   Tue   Wed   Thu   Fri        │  ← BOTTOM FOUNDATION
│   ☀     ⛅    ☁     🌧    ⛅         │
│  75°   72°   68°   65°   70°        │
│  62°   60°   58°   55°   58°        │
├─────────────────────────────────────┤
│ Updated 5 minutes ago               │  ← TEMPORAL ANCHOR
└─────────────────────────────────────┘
```

## Reading Pattern

The widget follows an **F-pattern** with an L-shaped conclusion:
1. Location (top-left entry point)
2. Icon + Temperature (left-center fixation)
3. Condition + Hi/Lo (rightward saccade)
4. Forecast row (leftward return, then horizontal scan)

## Arnheim Principles Applied

### 1. Structural Skeleton
The underlying framework of the scene must **reinforce** the chrome's structure:
- **Top-left**: Keep visually quiet (text legibility zone)
- **Center-left**: Allow moderate activity (icon has intrinsic interest)
- **Right side**: Available for visual complexity
- **Bottom third**: Darker/denser for compositional "weight" and grounding

### 2. Visual Weight Distribution
Arnheim: "Weight is the compositional property making an element attract the eye."

| Zone | Chrome Weight | Scene Requirement |
|------|---------------|-------------------|
| Top-left | High (location text) | LOW scene weight |
| Center-left | Very High (temp + icon) | MODERATE scene weight |
| Center-right | Medium (condition) | MODERATE-HIGH scene weight |
| Bottom | High (forecast row) | HIGH scene weight (grounding) |

### 3. Figure-Ground Relationship
The weather scene is **ground**; the chrome is **figure**.

Requirements for good separation:
- Sufficient luminance contrast (text uses drop-shadow)
- Avoid scene elements that compete for "figure" status
- Gradients preferable to sharp edges in scene

### 4. Directed Tension (Vectors)
Arnheim: "Directed tension is created by obliqueness."

Movement in weather scenes should flow **with** natural reading:
- ✓ Horizontal right (with reading direction)
- ✓ Diagonal down-right (with gravity + reading)
- ✗ Upward movement (fights gravity, creates tension)
- ✗ Leftward movement (fights reading direction)

### 5. Simplicity (Prägnanz)
Each condition should express **ONE dominant visual theme**:

| Condition | Dominant Theme |
|-----------|----------------|
| clear | Openness, radiance |
| partly-cloudy | Rhythm of gaps |
| cloudy | Layered uniformity |
| overcast | Compression, weight |
| fog | Dissolution of form |
| drizzle | Gentle texture |
| rain | Rhythmic motion |
| heavy-rain | Overwhelming intensity |
| thunderstorm | Dramatic tension |
| snow | Peaceful accumulation |
| sleet | Mixed signals |
| hail | Violence, impact |
| windy | Horizontal force |

### 6. Balance
Arnheim: "Balance is the state in which the forces acting upon a body compensate each other."

The chrome creates leftward weight. The scene should provide **asymmetric balance**:
- Place visual interest (clouds, celestial body) toward right
- Use horizon line to create vertical balance point
- Let precipitation flow down-right to balance left chrome mass

### 7. Grouping (Continuation)
Clouds and weather effects should feel like they **extend beyond the frame**.
- Avoid centered, complete cloud shapes
- Use partial forms at edges
- Create implied continuation

---

## Horizon Line Strategy

The horizon line (where clouds sit vertically) is critical:

| Condition | Horizon | Rationale |
|-----------|---------|-----------|
| clear | 0.30 | Maximize sky, emphasize openness |
| partly-cloudy | 0.42 | Show gaps above and below |
| cloudy | 0.48 | Balanced coverage |
| overcast | 0.58 | Clouds pressing down, oppressive |
| fog | 0.25 | Fog rises from below |
| drizzle | 0.46 | Comfortable middle ground |
| rain | 0.52 | Slightly lowered sky |
| heavy-rain | 0.58 | Sky closing in |
| thunderstorm | 0.62 | Maximum threat, minimal sky |
| snow | 0.42 | Open but cold |
| sleet | 0.50 | Neutral, conflicted |
| hail | 0.55 | Menacing |
| windy | 0.38 | Clouds streaking across open sky |

---

## Celestial Body Strategy

### Position (Arnheim: Visual Weight Through Isolation)

The celestial body has enormous intrinsic weight—it draws the eye powerfully. Position must:
- Balance the left-heavy chrome (location, icon, temperature)
- Create diagonal tension from temperature (lower-left) to sun/moon (upper-right)
- Relate meaningfully to the horizon/cloud layer

**Position by visibility:**
| Visibility | X Range | Y Range | Rationale |
|------------|---------|---------|-----------|
| Clear/prominent | 0.68–0.78 | 0.74–0.85 | High and right, commanding |
| Partially obscured | 0.58–0.68 | 0.65–0.74 | Lower, behind veil |
| Fully obscured | 0.52–0.58 | 0.58–0.65 | Doesn't matter, but consistent |

### Size (Atmospheric Optics)

**Critical insight**: Atmospheric conditions affect *apparent* celestial size.

| Condition | Effect | Size Multiplier |
|-----------|--------|-----------------|
| Clear | Crisp edges, appears smaller | 0.85× base |
| Partly-cloudy | Slight softening | 0.95× base |
| Cloudy | Light scattering enlarges glow | 1.2× base |
| Overcast | Large diffuse area | 1.4× base |
| **Fog** | **Massive halo effect** | **2.0× base** |
| Rain/storms | Obscured | 1.0× (not visible) |

Base sizes: Sun ~0.06, Moon ~0.05

**Fog is special**: When sun shines through fog, moisture particles scatter light creating a large, soft disc—often 2-3× the apparent clear-sky size. This is not artistic license; it's optical reality.

### Final Celestial Values

| Condition | Sun Size | Moon Size | X | Y |
|-----------|----------|-----------|-----|-----|
| clear | 0.052 | 0.044 | 0.70 | 0.80 |
| partly-cloudy | 0.058 | 0.048 | 0.65 | 0.74 |
| cloudy | 0.072 | 0.060 | 0.62 | 0.68 |
| overcast | 0.085 | 0.070 | 0.58 | 0.65 |
| **fog** | **0.120** | **0.095** | 0.65 | 0.85 |
| drizzle | 0.068 | 0.055 | 0.62 | 0.70 |
| rain | 0.065 | 0.052 | 0.60 | 0.66 |
| heavy-rain | 0.060 | 0.048 | 0.55 | 0.62 |
| thunderstorm | 0.055 | 0.045 | 0.52 | 0.58 |
| snow | 0.062 | 0.052 | 0.68 | 0.76 |
| sleet | 0.058 | 0.048 | 0.58 | 0.65 |
| hail | 0.058 | 0.048 | 0.55 | 0.62 |
| windy | 0.055 | 0.046 | 0.78 | 0.74 |

**Windy exception**: X pushed far right (0.78) so clouds "stream toward" the celestial body, creating directed tension aligned with wind vector.

---

## Per-Condition Compositional Notes

### Clear
- **Theme**: Radiance and openness
- **Structural**: Maximum negative space, single focal point (sun/moon)
- **Weight**: Concentrated in celestial body, distributed everywhere else
- **Vector**: Radiating outward from sun/moon (no directional motion)
- **Ground relationship**: Scene recedes, chrome advances

### Partly-Cloudy
- **Theme**: Rhythm and interruption
- **Structural**: Clouds create punctuation marks in sky
- **Weight**: Distributed between gaps (light) and clouds (moderate)
- **Vector**: Gentle rightward drift
- **Ground relationship**: Clouds provide mid-tone anchoring

### Cloudy
- **Theme**: Soft uniformity with depth
- **Structural**: Layered planes creating aerial perspective
- **Weight**: Even distribution creates calm
- **Vector**: Very slow drift, emphasize stillness
- **Ground relationship**: Even mid-tone, excellent text contrast

### Overcast
- **Theme**: Compression and weight
- **Structural**: Dense layer pressing down from above
- **Weight**: Heavy at top, creates oppressive feeling
- **Vector**: Minimal movement, static
- **Ground relationship**: Dark enough for high contrast

### Fog
- **Theme**: Dissolution and mystery
- **Structural**: Loss of edges, gradients dominate
- **Weight**: Diffuse, no focal point
- **Vector**: Imperceptible if any
- **Ground relationship**: Uniform provides excellent legibility

### Drizzle
- **Theme**: Gentle melancholy
- **Structural**: Fine texture overlaying soft clouds
- **Weight**: Light, delicate
- **Vector**: Slow vertical with slight angle
- **Ground relationship**: Soft gray, good separation

### Rain
- **Theme**: Active rhythm
- **Structural**: Diagonal lines create visual music
- **Weight**: Moderate, dynamic
- **Vector**: Clear diagonal down-right (with reading)
- **Ground relationship**: Darker tones, clear separation

### Heavy-Rain
- **Theme**: Overwhelming intensity
- **Structural**: Near-opacity, reduced visibility
- **Weight**: Maximum scene weight
- **Vector**: Strong diagonal, urgent
- **Ground relationship**: Very dark, maximum contrast

### Thunderstorm
- **Theme**: Drama and tension
- **Structural**: Lightning creates momentary focal disruption
- **Weight**: Extreme contrast between flash and dark
- **Vector**: Multiple conflicting vectors (rain, lightning)
- **Ground relationship**: Alternating—drop shadow critical

### Snow
- **Theme**: Peaceful accumulation
- **Structural**: Individual elements create collective texture
- **Weight**: Light individually, cumulative presence
- **Vector**: Gentle descent with horizontal drift
- **Ground relationship**: Light background, text shadow important

### Sleet
- **Theme**: Conflict and discomfort
- **Structural**: Two precipitation types, visual noise
- **Weight**: Medium-heavy, unsettled
- **Vector**: Mixed vectors create unease
- **Ground relationship**: Medium-dark, functional

### Hail
- **Theme**: Violence and impact
- **Structural**: Large, fast-moving elements
- **Weight**: Heavy, abrupt
- **Vector**: Steep, aggressive
- **Ground relationship**: Dark, high contrast

### Windy
- **Theme**: Horizontal force
- **Structural**: Stretched, elongated cloud forms
- **Weight**: Distributed along motion vector
- **Vector**: Strong horizontal rightward
- **Ground relationship**: Variable with cloud position

---

## Global Coherence

Across all conditions, maintain:
1. **Consistent celestial position** (upper-right quadrant)
2. **Consistent reading of depth** (darker at horizon, lighter at zenith for day)
3. **Consistent vector grammar** (down-right = with nature)
4. **Consistent luminance relationship** with text
5. **Consistent sense of extension** beyond frame
