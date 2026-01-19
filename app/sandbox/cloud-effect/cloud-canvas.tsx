"use client";

import { useEffect, useRef, useCallback } from "react";

interface CloudCanvasProps {
  className?: string;
  // Cloud shape
  cloudScale?: number; // 0.5-3, affects cloud size (lower = bigger clouds, higher = finer detail)
  coverage?: number; // 0-1, how much sky has clouds
  density?: number; // 0-1, opacity/thickness
  softness?: number; // 0-1, edge sharpness (0=sharp cumulus, 1=soft stratus)
  // Animation
  windSpeed?: number; // Wind animation speed
  windAngle?: number; // Wind direction in radians
  turbulence?: number; // How much clouds morph/churn
  // Lighting
  sunAltitude?: number; // -0.2 to 1, sun height (negative = night, 0 = horizon, 1 = zenith)
  sunAzimuth?: number; // Sun horizontal angle
  lightIntensity?: number; // Overall brightness
  ambientDarkness?: number; // How dark the cloud shadows are
  // Layers
  numLayers?: number; // 1-5 depth layers
  layerSpread?: number; // How spread out the layers are
  // Stars
  starDensity?: number; // 0-1, how many stars
  starSize?: number; // 0.5-3, how large stars appear
  starTwinkleSpeed?: number; // 0-3, how fast stars twinkle
  starTwinkleAmount?: number; // 0-1, how much stars twinkle
  // Positioning
  horizonLine?: number; // 0-1, vertical position of cloud layer (0=bottom, 1=top)
  // Compositing
  transparentBackground?: boolean; // When true, outputs alpha for compositing over other layers
  // Debug
  debug?: boolean;
}

const VERTEX_SHADER = `#version 300 es
in vec4 a_position;
out vec2 v_uv;

void main() {
  gl_Position = a_position;
  v_uv = a_position.xy * 0.5 + 0.5;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_cloudScale;
uniform float u_coverage;
uniform float u_density;
uniform float u_softness;
uniform float u_windSpeed;
uniform float u_windAngle;
uniform float u_turbulence;
uniform float u_sunAltitude;
uniform float u_sunAzimuth;
uniform float u_lightIntensity;
uniform float u_ambientDarkness;
uniform int u_numLayers;
uniform float u_layerSpread;
uniform float u_starDensity;
uniform float u_starSize;
uniform float u_starTwinkleSpeed;
uniform float u_starTwinkleAmount;
uniform float u_horizonLine;
uniform bool u_transparentBackground;
uniform bool u_debug;

#define PI 3.14159265359
#define MAX_LAYERS 10

// ============================================================================
// NOISE FUNCTIONS
// ============================================================================

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float hash31(vec3 p) {
  p = fract(p * vec3(234.34, 435.345, 123.45));
  p += dot(p, p.yzx + 34.23);
  return fract(p.x * p.y * p.z);
}

// Smooth value noise
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // Smoothstep

  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Worley/cellular noise for billowy cumulus
float worleyNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float minDist = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash21(i + neighbor) * 0.5 + 0.25 + neighbor;
      float d = length(point - f);
      minDist = min(minDist, d);
    }
  }
  return minDist;
}

// Inverted worley for billowy shapes
float billowNoise(vec2 p) {
  return 1.0 - worleyNoise(p);
}

// ============================================================================
// FRACTAL BROWNIAN MOTION
// ============================================================================

float fbmValue(vec2 p, int octaves, float lacunarity, float gain) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float maxValue = 0.0;

  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * valueNoise(p * frequency);
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return value / maxValue;
}

float fbmBillow(vec2 p, int octaves, float lacunarity, float gain) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float maxValue = 0.0;

  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * billowNoise(p * frequency);
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return value / maxValue;
}

// ============================================================================
// DOMAIN WARPING
// ============================================================================

// Warp coordinates using noise for more organic shapes
// time and turbulence parameters allow animated morphing
vec2 domainWarp(vec2 p, float strength, float scale, float time, float turbulence) {
  // Time-varying offset creates churning motion
  // Turbulence controls intensity, wind speed controls rapidity
  float morphSpeed = 0.15 * turbulence * (0.3 + u_windSpeed * 0.7);
  vec2 timeOffset1 = vec2(time * morphSpeed, time * morphSpeed * 0.7);
  vec2 timeOffset2 = vec2(time * morphSpeed * -0.5, time * morphSpeed * 0.3);

  // First layer of warp (animated)
  float warpX = fbmValue(p * scale + timeOffset1, 3, 2.0, 0.5) * 2.0 - 1.0;
  float warpY = fbmValue(p * scale + vec2(50.0, 50.0) + timeOffset1 * 0.8, 3, 2.0, 0.5) * 2.0 - 1.0;

  // Turbulence increases warp strength
  float dynamicStrength = strength * (1.0 + turbulence * 0.5);
  vec2 warped = p + vec2(warpX, warpY) * dynamicStrength;

  // Second layer for more complexity (animated differently)
  float warpX2 = fbmValue(warped * scale * 0.5 + vec2(100.0, 0.0) + timeOffset2, 2, 2.0, 0.5) * 2.0 - 1.0;
  float warpY2 = fbmValue(warped * scale * 0.5 + vec2(0.0, 100.0) + timeOffset2 * 1.2, 2, 2.0, 0.5) * 2.0 - 1.0;

  return warped + vec2(warpX2, warpY2) * dynamicStrength * 0.5;
}

// ============================================================================
// CLOUD DENSITY FUNCTIONS
// ============================================================================

// Cumulus: billowy, puffy, well-defined edges
float cumulusDensity(vec2 uv, vec2 offset, float scale, float time, float turbulence) {
  vec2 p = (uv + offset) * scale;

  // Apply domain warping for organic, flowing shapes
  // Time and turbulence create animated morphing
  vec2 warped = domainWarp(p, 0.4, 0.3, time, turbulence);

  // Wind-scaled animation rate
  float animRate = turbulence * (0.3 + u_windSpeed * 0.7);

  // Large-scale variation to create bigger cloud masses
  // Also animate slightly for slow billowing
  float largeMass = fbmValue(p * 0.15 + vec2(time * 0.02 * animRate), 2, 2.0, 0.6);

  // Base billow shape with warped coordinates
  float billow = fbmBillow(warped * 0.5, 4, 2.0, 0.5);

  // Add some value noise for detail (less warped to preserve fine detail)
  // Animate detail layer for additional churning at high turbulence
  float detail = fbmValue(p * 2.0 + vec2(time * 0.05 * animRate, 0.0), 3, 2.0, 0.5);

  // Combine: large masses modulate the billow, detail adds texture
  float base = billow * 0.6 + largeMass * 0.25 + detail * 0.15;

  // Boost contrast slightly to maintain cloud definition
  return smoothstep(0.1, 0.9, base);
}

// Stratus: flat, layered, smooth
float stratusDensity(vec2 uv, vec2 offset, float scale) {
  vec2 p = (uv + offset) * scale;

  // Stretched horizontally for layered look
  vec2 stretchedP = p * vec2(1.0, 3.0);

  // Smooth value noise
  float base = fbmValue(stretchedP * 0.3, 5, 2.0, 0.6);

  // Subtle detail
  float detail = fbmValue(p * 1.5, 3, 2.0, 0.4);

  return base * 0.8 + detail * 0.2;
}

// Cirrus: wispy, feathery, high altitude
float cirrusDensity(vec2 uv, vec2 offset, float scale) {
  vec2 p = (uv + offset) * scale;

  // Very stretched for wispy streaks
  vec2 stretchedP = p * vec2(1.0, 8.0);

  // Base wispy shape
  float base = fbmValue(stretchedP * 0.2, 4, 2.2, 0.55);

  // Turbulent detail with rotation
  float angle = p.x * 0.5 + base * 2.0;
  vec2 rotP = vec2(
    p.x * cos(angle * 0.1) - p.y * sin(angle * 0.1),
    p.x * sin(angle * 0.1) + p.y * cos(angle * 0.1)
  );
  float detail = fbmValue(rotP * 3.0, 3, 2.0, 0.4);

  // Threshold for wispy strands
  float wispy = smoothstep(0.3, 0.6, base + detail * 0.3);

  return wispy * 0.6;
}

// Stratocumulus: mix of lumpy and layered
float stratocumulusDensity(vec2 uv, vec2 offset, float scale) {
  vec2 p = (uv + offset) * scale;

  // Mix of billow and value noise
  float billow = fbmBillow(p * 0.4, 3, 2.0, 0.5);
  float layered = fbmValue(p * vec2(1.0, 2.0) * 0.5, 4, 2.0, 0.55);

  // Combine for clumpy but layered look
  return billow * 0.5 + layered * 0.5;
}

// Interpolate between cloud types
float cloudDensity(vec2 uv, vec2 offset, float scale, float cloudType, float time, float turbulence) {
  if (cloudType < 0.33) {
    // Cumulus to stratocumulus
    float t = cloudType / 0.33;
    float cumulus = cumulusDensity(uv, offset, scale, time, turbulence);
    float stratocumulus = stratocumulusDensity(uv, offset, scale);
    return mix(cumulus, stratocumulus, t);
  } else if (cloudType < 0.66) {
    // Stratocumulus to stratus
    float t = (cloudType - 0.33) / 0.33;
    float stratocumulus = stratocumulusDensity(uv, offset, scale);
    float stratus = stratusDensity(uv, offset, scale);
    return mix(stratocumulus, stratus, t);
  } else {
    // Stratus to cirrus
    float t = (cloudType - 0.66) / 0.34;
    float stratus = stratusDensity(uv, offset, scale);
    float cirrus = cirrusDensity(uv, offset, scale);
    return mix(stratus, cirrus, t);
  }
}

// ============================================================================
// STAR FIELD
// ============================================================================

vec3 renderStars(vec2 uv, float time, float sunAlt, float density, float starSize, float twinkleSpeed, float twinkleAmount) {
  // Fade in during twilight
  float visibility = smoothstep(0.02, -0.1, sunAlt);
  if (visibility < 0.001) return vec3(0.0);

  vec3 stars = vec3(0.0);

  // Grid-based star placement (aspect-ratio independent)
  float cellCount = 30.0 + density * 50.0; // 30-80 cells based on density
  vec2 grid = uv * cellCount;
  vec2 cellID = floor(grid);
  vec2 cellUV = fract(grid);

  // Check this cell and neighbors for stars (handles edge cases)
  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      vec2 neighborID = cellID + vec2(float(dx), float(dy));
      vec2 neighborUV = cellUV - vec2(float(dx), float(dy));

      // Deterministic random for this cell
      float h1 = hash21(neighborID);
      float h2 = hash21(neighborID + vec2(127.0, 311.0));
      float h3 = hash21(neighborID + vec2(269.0, 183.0));

      // Star probability based on density
      float prob = 0.15 + density * 0.25;
      if (h1 > prob) continue;

      // Star position within cell
      vec2 starPos = vec2(
        hash21(neighborID + vec2(50.0, 0.0)),
        hash21(neighborID + vec2(0.0, 50.0))
      ) * 0.8 + 0.1;

      float dist = length(neighborUV - starPos);

      // Star size (slight variation, scaled by parameter)
      float size = (0.02 + h2 * 0.03) * starSize;

      // Sharp point with soft glow
      float star = smoothstep(size, 0.0, dist);
      star += smoothstep(size * 2.5, 0.0, dist) * 0.2;

      // Brightness variation
      float brightness = 0.5 + h3 * 0.5;

      // Twinkling
      float twinklePhase = h1 * 6.283 + h2 * 100.0;
      float twinkleFreq = 2.0 + h3 * 3.0;
      float twinkle = sin(time * twinkleFreq * twinkleSpeed + twinklePhase);
      twinkle = twinkle * 0.5 + 0.5;
      twinkle = mix(1.0, twinkle, twinkleAmount);

      float intensity = star * brightness * twinkle;

      // Subtle color variation (mostly white with hints of warm/cool)
      vec3 warmTint = vec3(1.0, 0.92, 0.85);
      vec3 coolTint = vec3(0.9, 0.95, 1.0);
      vec3 white = vec3(1.0);
      vec3 color;
      if (h2 < 0.15) {
        color = warmTint; // Warm star
      } else if (h2 > 0.85) {
        color = coolTint; // Cool star
      } else {
        color = white;    // Most stars white
      }

      stars += color * intensity;
    }
  }

  return stars * visibility;
}

// ============================================================================
// SHOOTING STARS
// ============================================================================

vec3 renderShootingStars(vec2 uv, float time, float sunAlt) {
  // Only visible at night
  float visibility = smoothstep(0.0, -0.1, sunAlt);
  if (visibility < 0.001) return vec3(0.0);

  vec3 result = vec3(0.0);

  // Check multiple potential shooting stars (staggered timing)
  for (int i = 0; i < 3; i++) {
    float fi = float(i);

    // Each meteor has a different cycle offset and duration
    float cycleLength = 12.0 + fi * 7.0; // 12-26 second cycles
    float cycleTime = mod(time + fi * 37.0, cycleLength);

    // Meteor is only active for a brief window
    float meteorDuration = 0.8 + fi * 0.3;
    float meteorStart = cycleLength * 0.7; // Appear near end of cycle

    if (cycleTime < meteorStart || cycleTime > meteorStart + meteorDuration) continue;

    float t = (cycleTime - meteorStart) / meteorDuration; // 0 to 1 over meteor lifetime

    // Random start position and angle for this meteor (based on cycle)
    float cycle = floor((time + fi * 37.0) / cycleLength);
    float startX = hash21(vec2(cycle, fi * 100.0)) * 0.8 + 0.1;
    float startY = hash21(vec2(cycle + 50.0, fi * 100.0)) * 0.4 + 0.5; // Upper half
    float angle = -0.5 - hash21(vec2(cycle + 100.0, fi)) * 0.8; // Downward angle

    // Meteor travels across sky
    float speed = 0.4 + hash21(vec2(cycle + 150.0, fi)) * 0.3;
    vec2 meteorPos = vec2(startX, startY) + vec2(cos(angle), sin(angle)) * t * speed;

    // Meteor trail (line segment)
    float trailLength = 0.08 + hash21(vec2(cycle + 200.0, fi)) * 0.06;
    vec2 trailDir = normalize(vec2(cos(angle), sin(angle)));
    vec2 trailStart = meteorPos;
    vec2 trailEnd = meteorPos - trailDir * trailLength;

    // Distance to line segment
    vec2 pa = uv - trailStart;
    vec2 ba = trailEnd - trailStart;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float dist = length(pa - ba * h);

    // Fade along trail (bright at head, dim at tail)
    float trailFade = 1.0 - h;

    // Meteor intensity with distance falloff
    float width = 0.003;
    float meteor = smoothstep(width, 0.0, dist) * trailFade;

    // Fade in and out over lifetime
    float lifeFade = sin(t * 3.14159);

    // Bright white-blue color with slight tail coloring
    vec3 meteorColor = mix(vec3(0.8, 0.85, 1.0), vec3(1.0, 0.95, 0.8), h);

    result += meteorColor * meteor * lifeFade * 0.8;
  }

  return result * visibility;
}

// ============================================================================
// ATMOSPHERIC SKY
// ============================================================================

vec3 atmosphericSky(vec2 uv, float sunAlt) {
  // Sun altitude: 0 = horizon, 1 = zenith, can go negative for night

  // Night sky colors (sun below -0.1)
  vec3 nightTop = vec3(0.02, 0.02, 0.06);
  vec3 nightBot = vec3(0.04, 0.04, 0.1);

  // Twilight / blue hour colors (-0.1 to 0.05)
  vec3 twilightTop = vec3(0.15, 0.2, 0.4);
  vec3 twilightBot = vec3(0.25, 0.2, 0.35);

  // Golden hour / sunset colors (0.0 to 0.2)
  vec3 sunsetTop = vec3(0.3, 0.45, 0.7);
  vec3 sunsetMid = vec3(0.85, 0.5, 0.4);
  vec3 sunsetBot = vec3(1.0, 0.55, 0.25);

  // Day colors (above 0.3)
  vec3 dayTop = vec3(0.35, 0.55, 0.9);
  vec3 dayBot = vec3(0.65, 0.8, 0.95);

  // Calculate blend factors
  float nightFactor = 1.0 - smoothstep(-0.15, 0.0, sunAlt);
  float twilightFactor = smoothstep(-0.15, -0.05, sunAlt) * (1.0 - smoothstep(0.05, 0.15, sunAlt));
  float sunsetFactor = smoothstep(-0.05, 0.05, sunAlt) * (1.0 - smoothstep(0.15, 0.35, sunAlt));
  float dayFactor = smoothstep(0.2, 0.4, sunAlt);

  // Vertical gradient position with horizon emphasis during sunset
  float horizonEmphasis = sunsetFactor * pow(1.0 - abs(uv.y - 0.3) * 1.5, 2.0);

  // Build sky color
  vec3 skyTop = nightTop * nightFactor
              + twilightTop * twilightFactor
              + sunsetTop * sunsetFactor
              + dayTop * dayFactor;

  vec3 skyBot = nightBot * nightFactor
              + twilightBot * twilightFactor
              + sunsetBot * sunsetFactor
              + dayBot * dayFactor;

  // Base gradient
  vec3 sky = mix(skyBot, skyTop, pow(uv.y, 0.8));

  // Add warm horizon band during sunset/sunrise
  vec3 horizonGlow = sunsetMid * sunsetFactor * exp(-pow((uv.y - 0.2) * 4.0, 2.0));
  sky += horizonGlow * 0.6;

  // Add extra orange at very low horizon during golden hour
  float lowHorizonGlow = sunsetFactor * exp(-pow(uv.y * 6.0, 2.0));
  sky += vec3(0.4, 0.15, 0.0) * lowHorizonGlow;

  // Purple band above orange during sunset (Rayleigh scattering of remaining blue)
  float purpleBand = sunsetFactor * exp(-pow((uv.y - 0.45) * 5.0, 2.0)) * 0.3;
  sky += vec3(0.2, 0.1, 0.3) * purpleBand;

  return sky;
}

// ============================================================================
// CLOUD LIGHTING
// ============================================================================

vec3 cloudLighting(float density, float heightInCloud, float sunAlt, float lightInt, float ambDark) {
  // Overall daylight factor - dims everything as sun sets
  float daylight = smoothstep(-0.12, 0.1, sunAlt);

  // Night factor for transitioning to night colors
  float nightFactor = 1.0 - smoothstep(-0.12, 0.02, sunAlt);

  // Calculate warmth factor based on sun altitude
  // Low sun = warm colors, high sun = neutral colors
  float warmth = 1.0 - smoothstep(0.0, 0.4, sunAlt);
  warmth = warmth * warmth; // Ease in for more dramatic effect at low angles

  // Lit cloud color: white at midday, warm orange/gold at sunset, dark blue-grey at night
  vec3 dayLitColor = vec3(1.0, 0.98, 0.96);
  vec3 sunsetLitColor = vec3(1.0, 0.7, 0.45);
  vec3 nightLitColor = vec3(0.12, 0.14, 0.2); // Faint moonlit highlight
  vec3 litColor = mix(dayLitColor, sunsetLitColor, warmth);
  litColor = mix(litColor, nightLitColor, nightFactor);

  // Shadow color: cool blue-grey at midday, warm purple-brown at sunset, very dark at night
  vec3 dayShadowColor = vec3(0.45, 0.5, 0.6);
  vec3 sunsetShadowColor = vec3(0.35, 0.25, 0.3);
  vec3 nightShadowColor = vec3(0.03, 0.04, 0.07); // Nearly black
  vec3 shadowColor = mix(dayShadowColor, sunsetShadowColor, warmth);
  shadowColor = mix(shadowColor, nightShadowColor, nightFactor);
  shadowColor *= (1.0 - ambDark * 0.3);

  // Lighting calculation
  // Higher sun = lit from above, lower sun = more side/bottom lighting
  float topLight = heightInCloud * max(0.0, sunAlt);
  float sideLight = (1.0 - abs(heightInCloud - 0.5) * 2.0) * (1.0 - sunAlt * 0.5);

  // Bottom illumination when sun is very low (light bouncing up from horizon)
  float bottomLight = (1.0 - heightInCloud) * warmth * 0.5;

  // Ambient light - much lower at night (just faint starlight/moonlight)
  float ambientLight = mix(0.03, 0.2, daylight);

  float lightAmount = (topLight * 0.5 + sideLight * 0.3 + bottomLight) * daylight + ambientLight;
  lightAmount = clamp(lightAmount * lightInt, 0.0, 1.0);

  // Mix shadow and lit colors
  vec3 cloudColor = mix(shadowColor, litColor, lightAmount);

  // Rim lighting / silver lining effect (more pronounced at sunset, very faint at night)
  float rimLight = pow(density, 0.5) * (1.0 - density) * 4.0;
  vec3 rimColor = mix(vec3(1.0, 1.0, 0.95), vec3(1.0, 0.8, 0.5), warmth);
  rimColor = mix(rimColor, vec3(0.15, 0.18, 0.25), nightFactor); // Faint blue rim at night
  float rimStrength = mix(0.1, 0.3, daylight); // Dim rim at night
  cloudColor += rimColor * rimLight * rimStrength * lightInt;

  // Hot highlight on very bright parts during sunset (not at night)
  float hotSpot = pow(max(0.0, lightAmount - 0.6) * 2.5, 2.0) * warmth * daylight;
  cloudColor += vec3(1.0, 0.5, 0.2) * hotSpot * 0.4;

  return cloudColor;
}

// ============================================================================
// MAIN CLOUD RENDERING
// ============================================================================

vec4 renderCloudLayer(vec2 uv, float layerIndex, float totalLayers) {
  // Layer-specific variations
  float layerOffset = layerIndex / max(1.0, totalLayers - 1.0);
  float layerDepth = 1.0 - layerOffset * u_layerSpread;

  // Apply horizon line offset to shift clouds vertically
  // u_horizonLine 0.5 = centered, 0 = clouds at bottom, 1 = clouds at top
  float horizonOffset = (u_horizonLine - 0.5) * 1.5;
  float cloudY = uv.y - horizonOffset;

  // Wind offset with parallax
  vec2 windDir = vec2(cos(u_windAngle), sin(u_windAngle));
  float speed = u_windSpeed * (0.5 + layerDepth * 0.5);
  vec2 offset = windDir * u_time * speed * 0.1;

  // Scale varies per layer (further = smaller features)
  // u_cloudScale controls overall detail level
  float scale = (2.0 + layerIndex * 0.5) * u_cloudScale;

  // Get cumulus density (turbulence creates animated morphing/churning)
  float density = cumulusDensity(uv, offset + vec2(layerIndex * 10.0), scale, u_time, u_turbulence);

  // Height-based cloud distribution (clouds denser at bottom, dissipate toward top)
  // This creates the effect of being at or above cloud level
  float heightNoise = fbmValue(uv * 2.0 + offset * 0.5, 2, 2.0, 0.5) * 0.3;
  float cloudCeiling = 0.65 + heightNoise; // Irregular top boundary
  float heightFalloff = smoothstep(cloudCeiling, cloudCeiling - 0.4, cloudY);

  // Additional dissipation - clouds thin out and become wispier near the top
  float dissipation = smoothstep(0.3, 0.7, cloudY);
  density = mix(density, density * density, dissipation * 0.5); // Thin out upper clouds

  // Apply height-based density reduction
  density *= heightFalloff;

  // Apply coverage threshold
  float coverageThreshold = 1.0 - u_coverage;
  density = smoothstep(coverageThreshold - u_softness * 0.3, coverageThreshold + 0.1, density);

  // Height in cloud for lighting - use vertical UV position
  // Higher on screen = more lit by sun from above
  float heightInCloud = cloudY * 0.6 + density * 0.4;

  // Calculate lighting
  vec3 color = cloudLighting(density, heightInCloud, u_sunAltitude, u_lightIntensity, u_ambientDarkness);

  // === AERIAL PERSPECTIVE ===
  // Distant layers (higher index) get hazier, more blue-tinted, lower contrast
  float distance = layerOffset; // 0 = front, 1 = back

  // Haze color - blue-ish during day, darker at night
  float daylight = smoothstep(-0.1, 0.2, u_sunAltitude);
  vec3 hazeColor = mix(vec3(0.05, 0.06, 0.1), vec3(0.6, 0.7, 0.85), daylight);

  // Blend toward haze based on distance
  float hazeAmount = distance * distance * 0.5; // Quadratic falloff
  color = mix(color, hazeColor, hazeAmount);

  // Reduce contrast for distant layers
  float contrastReduction = 1.0 - distance * 0.3;
  color = mix(vec3(0.5), color, contrastReduction);

  // Apply density for alpha
  float alpha = density * u_density * (0.6 + layerDepth * 0.4);

  return vec4(color, alpha);
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  // Transparent mode: render only clouds with alpha for compositing
  if (u_transparentBackground) {
    vec3 cloudColor = vec3(0.0);
    float cloudAlpha = 0.0;

    for (int i = u_numLayers - 1; i >= 0; i--) {
      vec4 cloud = renderCloudLayer(uv, float(i), float(u_numLayers));
      cloudColor = mix(cloudColor, cloud.rgb, cloud.a);
      cloudAlpha = cloudAlpha + cloud.a * (1.0 - cloudAlpha);
    }

    fragColor = vec4(cloudColor, cloudAlpha);
    return;
  }

  // Normal mode: full sky with stars and clouds
  vec3 skyColor = atmosphericSky(v_uv, u_sunAltitude);

  vec3 stars = renderStars(v_uv, u_time, u_sunAltitude, u_starDensity, u_starSize, u_starTwinkleSpeed, u_starTwinkleAmount);
  skyColor += stars;

  vec3 shootingStars = renderShootingStars(v_uv, u_time, u_sunAltitude);
  skyColor += shootingStars;

  vec3 color = skyColor;

  for (int i = u_numLayers - 1; i >= 0; i--) {
    vec4 cloud = renderCloudLayer(uv, float(i), float(u_numLayers));
    color = mix(color, cloud.rgb, cloud.a);
  }

  if (u_debug) {
    vec2 windDir = vec2(cos(u_windAngle), sin(u_windAngle));
    vec2 offset = windDir * u_time * u_windSpeed * 0.1;
    float rawDensity = cumulusDensity(uv, offset, 2.0, u_time, u_turbulence);
    color = mix(color, vec3(rawDensity), 0.5);
  }

  fragColor = vec4(color, 1.0);
}
`;

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function CloudCanvas({
  className,
  cloudScale = 1.0,
  coverage = 0.5,
  density = 0.8,
  softness = 0.3,
  windSpeed = 1.0,
  windAngle = 0.2,
  turbulence = 0.5,
  sunAltitude = 0.3,
  sunAzimuth = 0.0,
  lightIntensity = 1.0,
  ambientDarkness = 0.3,
  numLayers = 3,
  layerSpread = 0.3,
  starDensity = 0.5,
  starSize = 1.5,
  starTwinkleSpeed = 1.0,
  starTwinkleAmount = 0.5,
  horizonLine = 0.5,
  transparentBackground = false,
  debug = false,
}: CloudCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    cloudScale: WebGLUniformLocation | null;
    coverage: WebGLUniformLocation | null;
    density: WebGLUniformLocation | null;
    softness: WebGLUniformLocation | null;
    windSpeed: WebGLUniformLocation | null;
    windAngle: WebGLUniformLocation | null;
    turbulence: WebGLUniformLocation | null;
    sunAltitude: WebGLUniformLocation | null;
    sunAzimuth: WebGLUniformLocation | null;
    lightIntensity: WebGLUniformLocation | null;
    ambientDarkness: WebGLUniformLocation | null;
    numLayers: WebGLUniformLocation | null;
    layerSpread: WebGLUniformLocation | null;
    starDensity: WebGLUniformLocation | null;
    starSize: WebGLUniformLocation | null;
    starTwinkleSpeed: WebGLUniformLocation | null;
    starTwinkleAmount: WebGLUniformLocation | null;
    horizonLine: WebGLUniformLocation | null;
    transparentBackground: WebGLUniformLocation | null;
    debug: WebGLUniformLocation | null;
  } | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.error("WebGL2 not supported");
      return false;
    }
    glRef.current = gl;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return false;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;
    programRef.current = program;

    uniformsRef.current = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      cloudScale: gl.getUniformLocation(program, "u_cloudScale"),
      coverage: gl.getUniformLocation(program, "u_coverage"),
      density: gl.getUniformLocation(program, "u_density"),
      softness: gl.getUniformLocation(program, "u_softness"),
      windSpeed: gl.getUniformLocation(program, "u_windSpeed"),
      windAngle: gl.getUniformLocation(program, "u_windAngle"),
      turbulence: gl.getUniformLocation(program, "u_turbulence"),
      sunAltitude: gl.getUniformLocation(program, "u_sunAltitude"),
      sunAzimuth: gl.getUniformLocation(program, "u_sunAzimuth"),
      lightIntensity: gl.getUniformLocation(program, "u_lightIntensity"),
      ambientDarkness: gl.getUniformLocation(program, "u_ambientDarkness"),
      numLayers: gl.getUniformLocation(program, "u_numLayers"),
      layerSpread: gl.getUniformLocation(program, "u_layerSpread"),
      starDensity: gl.getUniformLocation(program, "u_starDensity"),
      starSize: gl.getUniformLocation(program, "u_starSize"),
      starTwinkleSpeed: gl.getUniformLocation(program, "u_starTwinkleSpeed"),
      starTwinkleAmount: gl.getUniformLocation(program, "u_starTwinkleAmount"),
      horizonLine: gl.getUniformLocation(program, "u_horizonLine"),
      transparentBackground: gl.getUniformLocation(program, "u_transparentBackground"),
      debug: gl.getUniformLocation(program, "u_debug"),
    };

    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    startTimeRef.current = performance.now();
    return true;
  }, []);

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const uniforms = uniformsRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !uniforms || !canvas) return;

    const displayWidth = canvas.clientWidth * window.devicePixelRatio;
    const displayHeight = canvas.clientHeight * window.devicePixelRatio;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    const time = (performance.now() - startTimeRef.current) / 1000;

    gl.useProgram(program);
    gl.uniform1f(uniforms.time, time);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.cloudScale, cloudScale);
    gl.uniform1f(uniforms.coverage, coverage);
    gl.uniform1f(uniforms.density, density);
    gl.uniform1f(uniforms.softness, softness);
    gl.uniform1f(uniforms.windSpeed, windSpeed);
    gl.uniform1f(uniforms.windAngle, windAngle);
    gl.uniform1f(uniforms.turbulence, turbulence);
    gl.uniform1f(uniforms.sunAltitude, sunAltitude);
    gl.uniform1f(uniforms.sunAzimuth, sunAzimuth);
    gl.uniform1f(uniforms.lightIntensity, lightIntensity);
    gl.uniform1f(uniforms.ambientDarkness, ambientDarkness);
    gl.uniform1i(uniforms.numLayers, numLayers);
    gl.uniform1f(uniforms.layerSpread, layerSpread);
    gl.uniform1f(uniforms.starDensity, starDensity);
    gl.uniform1f(uniforms.starSize, starSize);
    gl.uniform1f(uniforms.starTwinkleSpeed, starTwinkleSpeed);
    gl.uniform1f(uniforms.starTwinkleAmount, starTwinkleAmount);
    gl.uniform1f(uniforms.horizonLine, horizonLine);
    gl.uniform1i(uniforms.transparentBackground, transparentBackground ? 1 : 0);
    gl.uniform1i(uniforms.debug, debug ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [
    cloudScale, coverage, density, softness,
    windSpeed, windAngle, turbulence,
    sunAltitude, sunAzimuth, lightIntensity, ambientDarkness,
    numLayers, layerSpread,
    starDensity, starSize, starTwinkleSpeed, starTwinkleAmount,
    horizonLine, transparentBackground, debug
  ]);

  useEffect(() => {
    if (initGL()) {
      render();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initGL, render]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
