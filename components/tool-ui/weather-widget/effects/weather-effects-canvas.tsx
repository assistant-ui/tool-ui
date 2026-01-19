"use client";

import { useEffect, useRef, useCallback } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface CelestialParams {
  timeOfDay: number;
  moonPhase: number;
  starDensity: number;
  celestialX: number;
  celestialY: number;
  sunSize: number;
  moonSize: number;
  sunGlowIntensity: number;
  sunGlowSize: number;
  sunRayCount: number;
  sunRayLength: number;
  sunRayIntensity: number;
  moonGlowIntensity: number;
  moonGlowSize: number;
}

export interface CloudParams {
  coverage: number;
  density: number;
  softness: number;
  windSpeed: number;
  windAngle: number;
  turbulence: number;
  lightIntensity: number;
  ambientDarkness: number;
  numLayers: number;
}

export interface RainParams {
  glassIntensity: number;
  glassZoom: number;
  fallingIntensity: number;
  fallingSpeed: number;
  fallingAngle: number;
  fallingStreakLength: number;
  fallingLayers: number;
}

export interface LightningParams {
  enabled: boolean;
  autoMode: boolean;
  autoInterval: number;
  flashIntensity: number;
  branchDensity: number;
}

export interface SnowParams {
  intensity: number;
  layers: number;
  fallSpeed: number;
  windSpeed: number;
  drift: number;
  flakeSize: number;
}

export interface InteractionParams {
  rainRefractionStrength: number;
  lightningSceneIllumination: number;
}

export interface LayerToggles {
  celestial: boolean;
  clouds: boolean;
  rain: boolean;
  lightning: boolean;
  snow: boolean;
}

export interface WeatherEffectsCanvasProps {
  className?: string;
  layers?: Partial<LayerToggles>;
  celestial?: Partial<CelestialParams>;
  cloud?: Partial<CloudParams>;
  rain?: Partial<RainParams>;
  lightning?: Partial<LightningParams>;
  snow?: Partial<SnowParams>;
  interactions?: Partial<InteractionParams>;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const DEFAULT_LAYERS: LayerToggles = {
  celestial: true,
  clouds: true,
  rain: false,
  lightning: false,
  snow: false,
};

const DEFAULT_CELESTIAL: CelestialParams = {
  timeOfDay: 0.5,
  moonPhase: 0.5,
  starDensity: 0.5,
  celestialX: 0.74,
  celestialY: 0.78,
  sunSize: 0.14,
  moonSize: 0.17,
  sunGlowIntensity: 3.05,
  sunGlowSize: 0.30,
  sunRayCount: 6,
  sunRayLength: 3.0,
  sunRayIntensity: 0.10,
  moonGlowIntensity: 3.45,
  moonGlowSize: 0.94,
};

const DEFAULT_CLOUD: CloudParams = {
  coverage: 0.5,
  density: 0.7,
  softness: 0.5,
  windSpeed: 0.3,
  windAngle: 0,
  turbulence: 0.3,
  lightIntensity: 1.0,
  ambientDarkness: 0.2,
  numLayers: 3,
};

const DEFAULT_RAIN: RainParams = {
  glassIntensity: 0.5,
  glassZoom: 1.0,
  fallingIntensity: 0.6,
  fallingSpeed: 1.0,
  fallingAngle: 0.1,
  fallingStreakLength: 1.0,
  fallingLayers: 4,
};

const DEFAULT_LIGHTNING: LightningParams = {
  enabled: false,
  autoMode: true,
  autoInterval: 8,
  flashIntensity: 1.0,
  branchDensity: 0.5,
};

const DEFAULT_SNOW: SnowParams = {
  intensity: 0.5,
  layers: 4,
  fallSpeed: 1.0,
  windSpeed: 0.3,
  drift: 0.3,
  flakeSize: 1.0,
};

const DEFAULT_INTERACTIONS: InteractionParams = {
  rainRefractionStrength: 1.0,
  lightningSceneIllumination: 0.6,
};

// =============================================================================
// SHADERS
// =============================================================================

const FULLSCREEN_VERTEX = /* glsl */ `#version 300 es
in vec4 a_position;
out vec2 v_uv;

void main() {
  gl_Position = a_position;
  v_uv = a_position.xy * 0.5 + 0.5;
}
`;

// Pass 1: Celestial (sky, sun, moon, stars)
const CELESTIAL_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_timeOfDay;
uniform float u_moonPhase;
uniform float u_starDensity;
uniform vec2 u_celestialPos;
uniform float u_sunSize;
uniform float u_moonSize;
uniform float u_sunGlowIntensity;
uniform float u_sunGlowSize;
uniform float u_sunRayCount;
uniform float u_sunRayLength;
uniform float u_sunRayIntensity;
uniform float u_moonGlowIntensity;
uniform float u_moonGlowSize;

#define PI 3.14159265359
#define TAU 6.28318530718

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float getSunVisibility(float timeOfDay) {
  float rise = smoothstep(0.2, 0.3, timeOfDay);
  float set = smoothstep(0.8, 0.7, timeOfDay);
  return rise * set;
}

float getMoonVisibility(float timeOfDay) {
  float nightStart = smoothstep(0.7, 0.85, timeOfDay);
  float nightEnd = smoothstep(0.3, 0.15, timeOfDay);
  return max(nightStart, nightEnd);
}

vec3 getSkyColor(vec2 uv, float timeOfDay) {
  vec3 dayTop = vec3(0.4, 0.6, 0.9);
  vec3 dayHorizon = vec3(0.7, 0.8, 0.95);
  vec3 sunsetTop = vec3(0.2, 0.2, 0.4);
  vec3 sunsetHorizon = vec3(0.9, 0.5, 0.2);
  vec3 nightTop = vec3(0.02, 0.02, 0.05);
  vec3 nightHorizon = vec3(0.05, 0.05, 0.1);

  float dayAmount = smoothstep(0.25, 0.4, timeOfDay) * smoothstep(0.75, 0.6, timeOfDay);
  float sunsetAmount = max(
    smoothstep(0.2, 0.3, timeOfDay) * smoothstep(0.4, 0.3, timeOfDay),
    smoothstep(0.6, 0.7, timeOfDay) * smoothstep(0.8, 0.7, timeOfDay)
  );
  float nightAmount = max(0.0, 1.0 - dayAmount - sunsetAmount);

  float gradientFactor = pow(1.0 - uv.y, 1.0);

  vec3 topColor = dayTop * dayAmount + sunsetTop * sunsetAmount + nightTop * nightAmount;
  vec3 horizonColor = dayHorizon * dayAmount + sunsetHorizon * sunsetAmount + nightHorizon * nightAmount;

  return mix(topColor, horizonColor, gradientFactor);
}

float drawStars(vec2 uv, float density, float time) {
  float stars = 0.0;
  for (int layer = 0; layer < 3; layer++) {
    float layerScale = 100.0 + float(layer) * 50.0;
    vec2 gridUV = uv * layerScale;
    vec2 gridID = floor(gridUV);
    vec2 gridFract = fract(gridUV);
    vec2 starPos = hash2(gridID + float(layer) * 100.0);
    float dist = length(gridFract - starPos);
    float starPresent = step(1.0 - density * 0.3, hash(gridID * (float(layer) + 1.0)));
    float starSize = 0.02 + hash(gridID.yx) * 0.03;
    float twinkle = sin(time * (2.0 + hash(gridID) * 3.0) + hash(gridID.yx) * TAU) * 0.3 + 0.7;
    float star = smoothstep(starSize, 0.0, dist) * starPresent * twinkle;
    star *= 1.0 - float(layer) * 0.3;
    stars += star;
  }
  return stars;
}

vec3 drawSun(vec2 uv, vec2 sunPos, float size) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 diff = (uv - sunPos) * aspect;
  float dist = length(diff);
  float angle = atan(diff.y, diff.x);

  float disc = 1.0 - smoothstep(size * 0.9, size, dist);

  vec3 sunCore = vec3(1.0, 1.0, 0.95);
  vec3 sunEdge = vec3(1.0, 0.9, 0.4);
  float edgeFactor = clamp(dist / size, 0.0, 1.0);
  vec3 sunColor = mix(sunCore, sunEdge, edgeFactor);

  float limbDarkening = 1.0 - pow(clamp(dist / size, 0.0, 1.0), 2.0) * 0.3;
  sunColor *= limbDarkening;

  float glowSize = max(0.1, u_sunGlowSize);
  float scaledDist = dist / glowSize;
  float glow1 = exp(-scaledDist * 8.0) * 0.5;
  float glow2 = exp(-scaledDist * 3.0) * 0.3;
  float glow3 = exp(-scaledDist * 1.5) * 0.15;

  vec3 glowColor = vec3(1.0, 0.8, 0.4);
  float glowTotal = (glow1 + glow2 + glow3) * u_sunGlowIntensity;

  float rays = 0.0;
  if (u_sunRayCount > 0.0 && u_sunRayIntensity > 0.0) {
    float rayAngle = angle * u_sunRayCount;
    float rayBase = pow(abs(cos(rayAngle)), 8.0);
    float rayNoise = noise(vec2(angle * 3.0, u_time * 0.1)) * 0.4 + 0.6;
    float rayPattern = rayBase * rayNoise;
    float maxRayDist = u_sunRayLength * 0.15;
    float rayFalloff = exp(-dist * dist / (maxRayDist * maxRayDist));
    float rayStart = smoothstep(size * 0.7, size * 1.2, dist);
    float rayEnd = smoothstep(size * 3.0, size * 1.5, dist);
    float rayIndex = floor(rayAngle / PI + 0.5);
    float rayLengthVar = 0.7 + hash(vec2(rayIndex, 0.0)) * 0.6;
    rayFalloff = exp(-dist * dist / (maxRayDist * maxRayDist * rayLengthVar));
    rays = rayPattern * rayFalloff * rayStart * rayEnd * u_sunRayIntensity;
    float rayFlicker = sin(u_time * 0.3 + angle * 4.0) * 0.08 + 0.92;
    rays *= rayFlicker;
  }

  vec3 rayColor = vec3(1.0, 0.92, 0.7);

  vec3 result = sunColor * disc * 2.0;
  result += glowColor * glowTotal;
  result += rayColor * rays;

  return result;
}

vec3 getSphereNormal(vec2 discUV) {
  float r2 = dot(discUV, discUV);
  if (r2 > 1.0) return vec3(0.0);
  float z = sqrt(1.0 - r2);
  return normalize(vec3(discUV.x, discUV.y, z));
}

vec3 getMoonSurfaceColor(vec3 normal, vec2 discUV) {
  float brightness = 0.7 + fbm(discUV * 5.0, 3) * 0.3;
  return vec3(brightness * 0.85, brightness * 0.83, brightness * 0.8);
}

vec4 drawMoon(vec2 uv, vec2 moonPos, float size, float phase) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 diff = (uv - moonPos) * aspect;
  float dist = length(diff);

  vec2 discUV = diff / size;
  float discDist = length(discUV);
  float disc = 1.0 - smoothstep(0.95, 1.0, discDist);

  float glowSize = max(0.1, u_moonGlowSize);
  float glowIntensity = u_moonGlowIntensity;

  if (disc < 0.001) {
    float scaledDist = dist / glowSize;
    float glow1 = exp(-scaledDist * 6.0) * 0.15;
    float glow2 = exp(-scaledDist * 2.0) * 0.06;
    vec3 glowColor = vec3(0.8, 0.85, 0.95);
    float phaseAngle = phase * TAU;
    vec3 sunDir = vec3(sin(phaseAngle), 0.0, -cos(phaseAngle));
    float glowPhase = max(0.2, dot(normalize(vec3(discUV, 0.5)), sunDir) * 0.5 + 0.5);
    return vec4(glowColor * (glow1 + glow2) * glowPhase * glowIntensity, 0.0);
  }

  vec3 normal = getSphereNormal(discUV);
  float phaseAngle = phase * TAU;
  vec3 sunDir = vec3(sin(phaseAngle), 0.0, -cos(phaseAngle));
  float NdotL = dot(normal, sunDir);
  float terminator = smoothstep(-0.02, 0.08, NdotL);

  vec3 baseColor = getMoonSurfaceColor(normal, discUV);
  vec3 ambient = baseColor * 0.03;
  vec3 lit = baseColor * terminator;
  vec3 moonSurface = ambient + lit;

  float limbDarkening = 1.0 - pow(discDist, 3.0) * 0.15;
  moonSurface *= limbDarkening;

  float rimLight = pow(1.0 - abs(NdotL), 4.0) * terminator * 0.1;
  moonSurface += vec3(1.0, 0.98, 0.95) * rimLight;

  float scaledDist = dist / glowSize;
  float glow1 = exp(-scaledDist * 6.0) * 0.12;
  float glow2 = exp(-scaledDist * 2.0) * 0.06;
  vec3 glowColor = vec3(0.8, 0.85, 0.95);
  float litAmount = max(0.1, terminator);
  vec3 glow = glowColor * (glow1 + glow2) * litAmount * glowIntensity;

  return vec4(moonSurface * disc + glow, disc);
}

void main() {
  vec2 uv = v_uv;

  vec3 color = getSkyColor(uv, u_timeOfDay);

  float nightFactor = getMoonVisibility(u_timeOfDay);
  if (nightFactor > 0.01) {
    float stars = drawStars(uv, u_starDensity, u_time);
    color += vec3(stars) * nightFactor;
  }

  float sunVis = getSunVisibility(u_timeOfDay);
  if (sunVis > 0.01) {
    vec3 sun = drawSun(uv, u_celestialPos, u_sunSize);
    color += sun * sunVis;
  }

  float moonVis = getMoonVisibility(u_timeOfDay);
  if (moonVis > 0.01) {
    vec4 moon = drawMoon(uv, u_celestialPos, u_moonSize, u_moonPhase);
    float alpha = moon.a * moonVis;
    color = mix(color, moon.rgb, alpha) + moon.rgb * (1.0 - moon.a) * moonVis;
  }

  fragColor = vec4(color, 1.0);
}
`;

// Pass 2: Clouds (composites over celestial)
const CLOUD_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_sceneTexture;
uniform float u_timeOfDay;
uniform float u_coverage;
uniform float u_density;
uniform float u_softness;
uniform float u_windSpeed;
uniform float u_windAngle;
uniform float u_turbulence;
uniform float u_lightIntensity;
uniform float u_ambientDarkness;
uniform int u_numLayers;

#define PI 3.14159265359

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float cloudLayer(vec2 uv, float time, float scale, float speed, float turbAmount) {
  vec2 wind = vec2(cos(u_windAngle), sin(u_windAngle)) * speed * time;
  vec2 p = uv * scale + wind;

  // Add turbulence morphing
  vec2 turbOffset = vec2(
    fbm(p * 0.5 + time * 0.1, 4),
    fbm(p * 0.5 + 100.0 + time * 0.1, 4)
  ) * turbAmount;

  float n = fbm(p + turbOffset, 6);
  return n;
}

void main() {
  vec2 uv = v_uv;
  vec4 scene = texture(u_sceneTexture, uv);

  // Sun altitude from time of day
  float sunAlt = u_timeOfDay < 0.5 ? u_timeOfDay * 2.0 : 2.0 - u_timeOfDay * 2.0;

  // Cloud rendering
  float totalCloud = 0.0;
  float totalLight = 0.0;

  for (int i = 0; i < 5; i++) {
    if (i >= u_numLayers) break;

    float layerIdx = float(i);
    float layerScale = 2.0 + layerIdx * 0.8;
    float layerSpeed = u_windSpeed * (1.0 - layerIdx * 0.15);
    float layerTurb = u_turbulence * (1.0 + layerIdx * 0.2);

    float cloud = cloudLayer(uv, u_time, layerScale, layerSpeed, layerTurb);

    // Threshold for coverage
    float threshold = 1.0 - u_coverage;
    cloud = smoothstep(threshold, threshold + u_softness, cloud);

    // Simple lighting
    float light = cloud * (0.5 + sunAlt * 0.5) * u_lightIntensity;

    // Accumulate with depth falloff
    float depth = 1.0 - layerIdx * 0.2;
    totalCloud += cloud * depth * u_density;
    totalLight += light * depth;
  }

  totalCloud = clamp(totalCloud, 0.0, 1.0);

  // Cloud color based on lighting
  vec3 cloudBright = vec3(1.0, 0.98, 0.95);
  vec3 cloudDark = vec3(0.3, 0.32, 0.38) * (1.0 - u_ambientDarkness);
  vec3 cloudColor = mix(cloudDark, cloudBright, totalLight);

  // Composite over scene
  vec3 color = mix(scene.rgb, cloudColor, totalCloud * 0.85);

  fragColor = vec4(color, 1.0);
}
`;

// Pass 3: Rain (refracts the scene)
const RAIN_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_sceneTexture;
uniform float u_glassIntensity;
uniform float u_glassZoom;
uniform float u_fallingIntensity;
uniform float u_fallingSpeed;
uniform float u_fallingAngle;
uniform float u_fallingStreakLength;
uniform int u_fallingLayers;
uniform float u_refractionStrength;

#define S(a, b, t) smoothstep(a, b, t)

vec3 N13(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

float N(float t) {
  return fract(sin(t * 12345.564) * 7658.76);
}

float Saw(float b, float t) {
  return S(0.0, b, t) * S(1.0, b, t);
}

vec2 DropLayer(vec2 uv, float t) {
  vec2 UV = uv;
  uv.y += t * 0.75;
  vec2 aspect = vec2(6.0, 1.0);
  vec2 grid = aspect * 2.0;
  vec2 id = floor(uv * grid);
  float colShift = N(id.x);
  uv.y += colShift;
  id = floor(uv * grid);
  vec3 n = N13(id.x * 35.2 + id.y * 2376.1);
  vec2 st = fract(uv * grid) - vec2(0.5, 0.0);
  float x = n.x - 0.5;
  float y = UV.y * 20.0;
  float wiggle = sin(y + sin(y));
  x += wiggle * (0.5 - abs(x)) * (n.z - 0.5);
  x *= 0.7;
  float ti = fract(t + n.z);
  y = (Saw(0.85, ti) - 0.5) * 0.9 + 0.5;
  vec2 p = vec2(x, y);
  float d = length((st - p) * aspect.yx);
  float mainDrop = S(0.4, 0.0, d);
  float r = sqrt(S(1.0, y, st.y));
  float cd = abs(st.x - x);
  float trail = S(0.23 * r, 0.15 * r * r, cd);
  float trailFront = S(-0.02, 0.02, st.y - y);
  trail *= trailFront * r * r;
  float y2 = fract(UV.y * 10.0) + (st.y - 0.5);
  float dd = length(st - vec2(x, y2));
  float droplets = S(0.3, 0.0, dd);
  float m = mainDrop + droplets * r * trailFront;
  return vec2(m, trail);
}

float StaticDrops(vec2 uv, float t) {
  uv *= 40.0;
  vec2 id = floor(uv);
  uv = fract(uv) - 0.5;
  vec3 n = N13(id.x * 107.45 + id.y * 3543.654);
  vec2 p = (n.xy - 0.5) * 0.7;
  float d = length(uv - p);
  float fade = Saw(0.025, fract(t + n.z));
  float c = S(0.3, 0.0, d) * fract(n.z * 10.0) * fade;
  return c;
}

vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
  float s = StaticDrops(uv, t) * l0;
  vec2 m1 = DropLayer(uv, t) * l1;
  vec2 m2 = DropLayer(uv * 1.85, t) * l2;
  float c = s + m1.x + m2.x;
  c = S(0.3, 1.0, c);
  return vec2(c, max(m1.y * l0, m2.y * l1));
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 FallingRainLayer(vec2 uv, float t, float speed, float angle, float streakLen, float scale, float density) {
  vec2 offset = vec2(0.0);
  vec2 p = uv;
  p.x += p.y * angle;
  p *= scale;
  p.y += t * speed;
  vec2 id = floor(p);
  vec2 gv = fract(p) - 0.5;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      vec2 cellId = id + offs;
      float n1 = hash12(cellId);
      if (n1 > density) continue;
      vec2 n2 = vec2(hash12(cellId * 17.23), hash12(cellId * 31.17));
      vec2 dropPos = offs + n2 - 0.5;
      vec2 localUV = gv - dropPos;
      float streakW = 0.025 + n1 * 0.02;
      float streakH = streakLen * (0.4 + hash12(cellId * 7.13) * 0.6);
      float t_pos = (localUV.y + streakH) / (2.0 * streakH);
      t_pos = clamp(t_pos, 0.0, 1.0);
      if (abs(localUV.y) > streakH * 1.2) continue;
      float taper = mix(1.3, 0.4, t_pos * t_pos);
      float width = streakW * taper;
      float core = S(width, width * 0.2, abs(localUV.x));
      float vertFade = S(0.0, 0.1, t_pos) * S(1.0, 0.85, t_pos);
      float streak = core * vertFade;
      if (streak > 0.001) {
        offset.x += localUV.x * streak * 0.5;
        offset.y += (n1 - 0.5) * streak * 0.1;
      }
    }
  }
  return offset;
}

vec2 FallingRain(vec2 uv, float t) {
  vec2 totalOffset = vec2(0.0);
  if (u_fallingIntensity < 0.01) return totalOffset;

  float speed = u_fallingSpeed * 5.0;
  float streakLen = u_fallingStreakLength * 0.3;

  for (int i = 0; i < 6; i++) {
    if (i >= u_fallingLayers) break;
    float layerIdx = float(i);
    float depth = layerIdx / float(max(u_fallingLayers - 1, 1));
    float layerScale = mix(6.0, 30.0, depth);
    float layerSpeed = speed * mix(2.0, 0.5, depth);
    float layerDensity = u_fallingIntensity * mix(0.8, 0.3, depth);
    float layerStrength = mix(1.0, 0.15, depth);
    float layerStreakLen = streakLen * mix(1.5, 0.4, depth);
    float layerAngle = u_fallingAngle * mix(1.0, 0.6, depth);
    vec2 layerOffset = vec2(sin(layerIdx * 73.156) * 3.0, cos(layerIdx * 37.842) * 3.0);
    vec2 layer = FallingRainLayer(uv + layerOffset, t + layerIdx * 0.13, layerSpeed, layerAngle, layerStreakLen, layerScale, layerDensity);
    totalOffset += layer * layerStrength;
  }
  return totalOffset * 0.4;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  vec2 UV = v_uv;

  uv *= u_glassZoom;
  float t = u_time * 0.2;

  float rainAmount = u_glassIntensity;
  float staticDrops = S(-0.5, 1.0, rainAmount) * 2.0;
  float layer1 = S(0.25, 0.75, rainAmount);
  float layer2 = S(0.0, 0.5, rainAmount);

  vec2 c = Drops(uv, t, staticDrops, layer1, layer2);

  vec2 e = vec2(0.001, 0.0);
  float cx = Drops(uv + e, t, staticDrops, layer1, layer2).x;
  float cy = Drops(uv + e.yx, t, staticDrops, layer1, layer2).x;
  vec2 glassNormal = vec2(cx - c.x, cy - c.x);

  vec2 fallingRainOffset = FallingRain(uv, u_time);

  vec2 totalRefraction = (glassNormal + fallingRainOffset) * u_refractionStrength;

  vec2 refractedUV = UV + totalRefraction;
  refractedUV = clamp(refractedUV, 0.0, 1.0);

  vec3 color = texture(u_sceneTexture, refractedUV).rgb;

  // Subtle specular on rain
  float rainMagnitude = length(fallingRainOffset);
  if (rainMagnitude > 0.001) {
    vec3 refractedLight = texture(u_sceneTexture, refractedUV).rgb;
    float brightness = dot(refractedLight, vec3(0.299, 0.587, 0.114));
    float specular = rainMagnitude * 15.0 * (0.1 + brightness * 0.9);
    color += vec3(0.8, 0.85, 0.95) * specular * 0.3;
  }

  color += vec3(0.1, 0.12, 0.15) * c.x * 0.5;

  fragColor = vec4(color, 1.0);
}
`;

// Pass 4: Lightning (illuminates scene with procedural bolts)
const LIGHTNING_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_sceneTexture;
uniform bool u_enabled;
uniform float u_flashIntensity;
uniform float u_branchDensity;
uniform float u_sceneIllumination;
uniform float u_lastFlashTime;
uniform float u_strikeSeed;

#define MAX_SEGMENTS 32
#define MAX_BRANCHES 16
#define PI 3.14159265359

float easeOutSine(float t) { return sin(t * PI * 0.5); }
float easeInSine(float t) { return 1.0 - cos(t * PI * 0.5); }
float easeInOutSine(float t) { return -(cos(PI * t) - 1.0) * 0.5; }
float easeOutQuad(float t) { return 1.0 - (1.0 - t) * (1.0 - t); }
float easeOutCubic(float t) { float inv = 1.0 - t; return 1.0 - inv * inv * inv; }

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

vec2 displacedPoint(vec2 start, vec2 end, float t, float seed, float displacementAmt) {
  vec2 basePoint = mix(start, end, t);
  vec2 dir = end - start;
  vec2 perp = normalize(vec2(-dir.y, dir.x));
  float envelope = sin(t * PI);
  float n1 = noise(vec2(t * 8.0, seed * 100.0)) * 2.0 - 1.0;
  float n2 = noise(vec2(t * 16.0, seed * 100.0 + 50.0)) * 2.0 - 1.0;
  float n3 = noise(vec2(t * 32.0, seed * 100.0 + 100.0)) * 2.0 - 1.0;
  float displacement = (n1 * 0.6 + n2 * 0.3 + n3 * 0.1) * envelope * displacementAmt;
  float targetBias = 1.0 - t * 0.3;
  displacement *= targetBias;
  return basePoint + perp * displacement * length(dir);
}

float mainBoltDistance(vec2 uv, vec2 start, vec2 end, float seed, float displacementAmt) {
  float minDist = 999.0;
  vec2 prevPoint = start;
  for (int i = 1; i <= MAX_SEGMENTS; i++) {
    float t = float(i) / float(MAX_SEGMENTS);
    vec2 currPoint = displacedPoint(start, end, t, seed, displacementAmt);
    float d = distToSegment(uv, prevPoint, currPoint);
    minDist = min(minDist, d);
    prevPoint = currPoint;
  }
  return minDist;
}

float branchDistance(vec2 uv, vec2 branchStart, vec2 branchDir, float branchLen, float seed, float displacementAmt) {
  vec2 branchEnd = branchStart + branchDir * branchLen;
  float minDist = 999.0;
  vec2 prevPoint = branchStart;
  for (int i = 1; i <= 12; i++) {
    float t = float(i) / 12.0;
    vec2 currPoint = displacedPoint(branchStart, branchEnd, t, seed, displacementAmt * 0.7);
    float d = distToSegment(uv, prevPoint, currPoint);
    minDist = min(minDist, d);
    prevPoint = currPoint;
  }
  return minDist;
}

vec2 branchesDistance(vec2 uv, vec2 start, vec2 end, float seed, float displacementAmt, float density) {
  float minDist = 999.0;
  float brightness = 0.0;
  vec2 mainDir = normalize(end - start);
  float mainLen = length(end - start);

  for (int i = 0; i < MAX_BRANCHES; i++) {
    float idx = float(i);
    float branchT = 0.15 + hash11(seed + idx * 7.31) * 0.7;
    float branchProb = (1.0 - branchT) * density;
    if (hash11(seed + idx * 3.17) > branchProb) continue;

    vec2 branchStart = displacedPoint(start, end, branchT, seed, displacementAmt);
    float angleOffset = (hash11(seed + idx * 11.13) * 2.0 - 1.0) * 0.6;
    float side = hash11(seed + idx * 5.71) > 0.5 ? 1.0 : -1.0;
    float angle = atan(mainDir.y, mainDir.x) + side * (0.3 + abs(angleOffset) * 0.5);
    vec2 branchDir = vec2(cos(angle), sin(angle));
    float branchLen = mainLen * (0.15 + hash11(seed + idx * 13.37) * 0.25);

    float d = branchDistance(uv, branchStart, branchDir, branchLen, seed + idx * 100.0, displacementAmt);
    if (d < minDist) {
      minDist = d;
      brightness = 0.5 - branchT * 0.2;
    }

    if (density > 0.3 && hash11(seed + idx * 17.19) < density * 0.5) {
      float subT = 0.3 + hash11(seed + idx * 19.23) * 0.4;
      vec2 subStart = branchStart + branchDir * branchLen * subT;
      float subAngle = angle + (hash11(seed + idx * 23.29) * 2.0 - 1.0) * 0.5;
      vec2 subDir = vec2(cos(subAngle), sin(subAngle));
      float subLen = branchLen * 0.4;
      float subD = branchDistance(uv, subStart, subDir, subLen, seed + idx * 200.0, displacementAmt * 0.5);
      if (subD < minDist) {
        minDist = subD;
        brightness = 0.25;
      }
    }
  }
  return vec2(minDist, brightness);
}

vec3 lightningGlow(float dist, float brightness, float intensity, float thickness) {
  float scaledDist = dist / max(thickness, 0.1);
  float core = smoothstep(0.003, 0.0, scaledDist) * brightness;
  float innerGlow = exp(-scaledDist * 150.0) * brightness;
  float outerGlow = exp(-dist * dist * 3000.0) * brightness * thickness;

  vec3 coreColor = vec3(1.0, 1.0, 1.0);
  vec3 innerColor = vec3(0.7, 0.8, 1.0);
  vec3 outerColor = vec3(0.5, 0.5, 0.9);

  vec3 color = coreColor * core * 2.0;
  color += innerColor * innerGlow * 0.8;
  color += outerColor * outerGlow * 0.5;
  return color * intensity;
}

float flashEnvelope(float timeSinceStrike, float duration) {
  if (timeSinceStrike < 0.0 || timeSinceStrike > duration) return 0.0;
  float t = timeSinceStrike / duration;
  float attackT = clamp(t / 0.03, 0.0, 1.0);
  float attack = easeOutCubic(attackT);
  float sustainT = clamp((t - 0.05) / 0.65, 0.0, 1.0);
  float sustain = 1.0 - easeInOutSine(sustainT);
  float decay = exp(-t * 2.0);
  decay = mix(decay, easeOutSine(1.0 - t), 0.3);
  float endT = clamp((t - 0.75) / 0.25, 0.0, 1.0);
  float endFade = 1.0 - easeInSine(endT);
  return attack * max(sustain, decay * 0.4) * endFade;
}

float restrikeEnvelope(float timeSinceStrike, float duration, float seed) {
  float env = flashEnvelope(timeSinceStrike, duration * 0.7);
  if (hash11(seed * 7.7) > 0.7) {
    float restrike1 = flashEnvelope(timeSinceStrike - duration * 0.5, duration * 0.3);
    env = max(env, restrike1 * 0.6);
  }
  if (hash11(seed * 11.3) > 0.85) {
    float restrike2 = flashEnvelope(timeSinceStrike - duration * 0.75, duration * 0.2);
    env = max(env, restrike2 * 0.4);
  }
  return env;
}

void main() {
  vec4 scene = texture(u_sceneTexture, v_uv);

  if (!u_enabled) {
    fragColor = scene;
    return;
  }

  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float timeSinceStrike = u_time - u_lastFlashTime;
  float durationSec = 0.8;

  float flash = restrikeEnvelope(timeSinceStrike, durationSec, u_strikeSeed);
  float afterimageDuration = durationSec * 1.5;
  float afterimageT = clamp(timeSinceStrike / afterimageDuration, 0.0, 1.0);
  float afterimage = timeSinceStrike < 0.0 ? 0.0 : (1.0 - easeInSine(afterimageT));

  float sceneFlash = flash * u_sceneIllumination;
  vec3 color = scene.rgb;
  color += vec3(0.3, 0.32, 0.4) * sceneFlash;

  if (flash > 0.01 || afterimage > 0.01) {
    vec2 strikeHash = hash22(vec2(u_strikeSeed * 123.456, u_strikeSeed * 789.012));
    vec2 boltStart = vec2((0.3 + strikeHash.x * 0.4) * aspect, 1.05);
    vec2 boltEnd = vec2(boltStart.x + (strikeHash.x - 0.5) * 0.4, -0.05);

    float displacementAmt = 0.15;
    float mainDist = mainBoltDistance(uv, boltStart, boltEnd, u_strikeSeed, displacementAmt);
    vec2 branchResult = branchesDistance(uv, boltStart, boltEnd, u_strikeSeed, displacementAmt, u_branchDensity);
    float branchDist = branchResult.x;
    float branchBrightness = branchResult.y;

    float mainThickness = mix(0.2, 1.0, easeOutSine(sqrt(max(flash, 0.0))));
    vec3 afterglowColor = vec3(0.5, 0.45, 0.7);

    vec3 mainCore = lightningGlow(mainDist, easeOutQuad(max(flash, 0.0)), u_flashIntensity, mainThickness);
    float mainAfterglowDist = mainDist * 0.6;
    float mainAfterglowStrength = exp(-mainAfterglowDist * 50.0) * afterimage * 0.5;
    vec3 mainAfterglow = afterglowColor * mainAfterglowStrength;

    float branchThickness = mix(0.15, 1.0, easeOutSine(max(flash, 0.0)));
    vec3 branchCore = lightningGlow(branchDist, branchBrightness * easeOutQuad(max(flash, 0.0)), u_flashIntensity, branchThickness);
    float branchAfterglowDist = branchDist * 0.7;
    float branchAfterglowStrength = exp(-branchAfterglowDist * 80.0) * branchBrightness * afterimage * 0.4;
    vec3 branchAfterglow = afterglowColor * branchAfterglowStrength;

    color += (mainCore + branchCore) * max(flash, 0.0);
    color += (mainAfterglow + branchAfterglow) * afterimage;

    float sourceGlow = exp(-length(uv - boltStart) * 3.0);
    color += vec3(0.4, 0.45, 0.6) * sourceGlow * afterimage * 0.3;
  }

  fragColor = vec4(color, 1.0);
}
`;

// Pass 5: Snow
const SNOW_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_sceneTexture;
uniform float u_intensity;
uniform int u_layers;
uniform float u_fallSpeed;
uniform float u_windSpeed;
uniform float u_drift;
uniform float u_flakeSize;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float snowLayer(vec2 uv, float layerIdx, float time) {
  float depth = layerIdx / float(max(u_layers - 1, 1));

  // Layer parameters
  float scale = mix(30.0, 80.0, depth);
  float speed = u_fallSpeed * mix(1.0, 0.4, depth);
  float wind = u_windSpeed * mix(1.0, 0.5, depth);
  float size = u_flakeSize * mix(1.0, 0.3, depth);
  float opacity = mix(1.0, 0.3, depth);

  // Animate
  vec2 p = uv * scale;
  p.y += time * speed * 50.0;
  p.x += sin(time * 0.5 + layerIdx) * wind * 10.0;
  p.x += sin(p.y * 0.1 + time) * u_drift * 5.0;

  // Grid
  vec2 id = floor(p);
  vec2 gv = fract(p) - 0.5;

  float snow = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      vec2 cellId = id + offs;

      float n = hash(cellId + layerIdx * 100.0);
      if (n > u_intensity) continue;

      vec2 pos = offs + vec2(hash(cellId * 1.23), hash(cellId * 4.56)) - 0.5;
      float d = length(gv - pos);

      float flake = smoothstep(size * 0.05, 0.0, d);
      snow += flake * opacity;
    }
  }

  return snow;
}

void main() {
  vec4 scene = texture(u_sceneTexture, v_uv);

  float snow = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= u_layers) break;
    snow += snowLayer(v_uv, float(i), u_time);
  }

  snow = clamp(snow, 0.0, 1.0);

  vec3 color = scene.rgb + vec3(snow);

  fragColor = vec4(color, 1.0);
}
`;

// Final composite (just passes through, but could add post-processing)
const COMPOSITE_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_sceneTexture;

void main() {
  fragColor = texture(u_sceneTexture, v_uv);
}
`;

// =============================================================================
// WEBGL HELPERS
// =============================================================================

function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader | null {
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

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

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

interface Framebuffer {
  fbo: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
}

function createFramebuffer(gl: WebGL2RenderingContext, width: number, height: number): Framebuffer | null {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer();
  if (!fbo) return null;

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return { fbo, texture, width, height };
}

function resizeFramebuffer(gl: WebGL2RenderingContext, fb: Framebuffer, width: number, height: number): void {
  if (fb.width === width && fb.height === height) return;

  gl.bindTexture(gl.TEXTURE_2D, fb.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  fb.width = width;
  fb.height = height;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WeatherEffectsCanvas({
  className,
  layers: layersProp,
  celestial: celestialProp,
  cloud: cloudProp,
  rain: rainProp,
  lightning: lightningProp,
  snow: snowProp,
  interactions: interactionsProp,
}: WeatherEffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastFlashTimeRef = useRef<number>(-100);
  const nextFlashTimeRef = useRef<number>(0);
  const strikeSeedRef = useRef<number>(Math.random());

  // Programs
  const programsRef = useRef<{
    celestial: WebGLProgram | null;
    cloud: WebGLProgram | null;
    rain: WebGLProgram | null;
    lightning: WebGLProgram | null;
    snow: WebGLProgram | null;
    composite: WebGLProgram | null;
  }>({
    celestial: null,
    cloud: null,
    rain: null,
    lightning: null,
    snow: null,
    composite: null,
  });

  // Framebuffers (ping-pong)
  const fbRef = useRef<{
    a: Framebuffer | null;
    b: Framebuffer | null;
  }>({ a: null, b: null });

  // Store props in ref for render loop
  const propsRef = useRef({
    layers: { ...DEFAULT_LAYERS, ...layersProp },
    celestial: { ...DEFAULT_CELESTIAL, ...celestialProp },
    cloud: { ...DEFAULT_CLOUD, ...cloudProp },
    rain: { ...DEFAULT_RAIN, ...rainProp },
    lightning: { ...DEFAULT_LIGHTNING, ...lightningProp },
    snow: { ...DEFAULT_SNOW, ...snowProp },
    interactions: { ...DEFAULT_INTERACTIONS, ...interactionsProp },
  });

  propsRef.current = {
    layers: { ...DEFAULT_LAYERS, ...layersProp },
    celestial: { ...DEFAULT_CELESTIAL, ...celestialProp },
    cloud: { ...DEFAULT_CLOUD, ...cloudProp },
    rain: { ...DEFAULT_RAIN, ...rainProp },
    lightning: { ...DEFAULT_LIGHTNING, ...lightningProp },
    snow: { ...DEFAULT_SNOW, ...snowProp },
    interactions: { ...DEFAULT_INTERACTIONS, ...interactionsProp },
  };

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL2 not supported");
      return false;
    }
    glRef.current = gl;

    // Create programs
    programsRef.current.celestial = createProgram(gl, FULLSCREEN_VERTEX, CELESTIAL_FRAGMENT);
    programsRef.current.cloud = createProgram(gl, FULLSCREEN_VERTEX, CLOUD_FRAGMENT);
    programsRef.current.rain = createProgram(gl, FULLSCREEN_VERTEX, RAIN_FRAGMENT);
    programsRef.current.lightning = createProgram(gl, FULLSCREEN_VERTEX, LIGHTNING_FRAGMENT);
    programsRef.current.snow = createProgram(gl, FULLSCREEN_VERTEX, SNOW_FRAGMENT);
    programsRef.current.composite = createProgram(gl, FULLSCREEN_VERTEX, COMPOSITE_FRAGMENT);

    // Create framebuffers
    const width = canvas.clientWidth * window.devicePixelRatio;
    const height = canvas.clientHeight * window.devicePixelRatio;
    fbRef.current.a = createFramebuffer(gl, width, height);
    fbRef.current.b = createFramebuffer(gl, width, height);

    // Setup fullscreen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Setup vertex attributes for all programs
    for (const program of Object.values(programsRef.current)) {
      if (program) {
        const positionLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
      }
    }

    startTimeRef.current = performance.now();
    return true;
  }, []);

  const render = useCallback(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    const programs = programsRef.current;
    const fb = fbRef.current;
    const props = propsRef.current;

    if (!gl || !canvas || !fb.a || !fb.b) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }

    // Resize handling
    const displayWidth = Math.floor(canvas.clientWidth * window.devicePixelRatio);
    const displayHeight = Math.floor(canvas.clientHeight * window.devicePixelRatio);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      resizeFramebuffer(gl, fb.a, displayWidth, displayHeight);
      resizeFramebuffer(gl, fb.b, displayWidth, displayHeight);
    }

    const time = (performance.now() - startTimeRef.current) / 1000;

    // Lightning auto-trigger
    if (props.layers.lightning && props.lightning.enabled && props.lightning.autoMode) {
      if (time >= nextFlashTimeRef.current) {
        lastFlashTimeRef.current = time;
        strikeSeedRef.current = Math.random();
        nextFlashTimeRef.current = time + props.lightning.autoInterval * (0.5 + Math.random());
      }
    }

    // Ping-pong framebuffers
    let readFB = fb.a;
    let writeFB = fb.b;

    const swapBuffers = () => {
      const temp = readFB;
      readFB = writeFB;
      writeFB = temp;
    };

    // === PASS 1: Celestial ===
    if (props.layers.celestial && programs.celestial) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFB.fbo);
      gl.viewport(0, 0, displayWidth, displayHeight);
      gl.useProgram(programs.celestial);

      const p = props.celestial;
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_time"), time);
      gl.uniform2f(gl.getUniformLocation(programs.celestial, "u_resolution"), displayWidth, displayHeight);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_timeOfDay"), p.timeOfDay);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_moonPhase"), p.moonPhase);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_starDensity"), p.starDensity);
      gl.uniform2f(gl.getUniformLocation(programs.celestial, "u_celestialPos"), p.celestialX, p.celestialY);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_sunSize"), p.sunSize);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_moonSize"), p.moonSize);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_sunGlowIntensity"), p.sunGlowIntensity);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_sunGlowSize"), p.sunGlowSize);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_sunRayCount"), p.sunRayCount);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_sunRayLength"), p.sunRayLength);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_sunRayIntensity"), p.sunRayIntensity);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_moonGlowIntensity"), p.moonGlowIntensity);
      gl.uniform1f(gl.getUniformLocation(programs.celestial, "u_moonGlowSize"), p.moonGlowSize);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      swapBuffers();
    } else {
      // Clear to black if no celestial
      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFB.fbo);
      gl.viewport(0, 0, displayWidth, displayHeight);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      swapBuffers();
    }

    // === PASS 2: Clouds ===
    if (props.layers.clouds && programs.cloud) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFB.fbo);
      gl.viewport(0, 0, displayWidth, displayHeight);
      gl.useProgram(programs.cloud);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readFB.texture);
      gl.uniform1i(gl.getUniformLocation(programs.cloud, "u_sceneTexture"), 0);

      const p = props.cloud;
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_time"), time);
      gl.uniform2f(gl.getUniformLocation(programs.cloud, "u_resolution"), displayWidth, displayHeight);
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_timeOfDay"), props.celestial.timeOfDay);
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_coverage"), p.coverage);
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_density"), p.density);
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_softness"), p.softness);
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_windSpeed"), p.windSpeed);
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_windAngle"), p.windAngle);
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_turbulence"), p.turbulence);
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_lightIntensity"), p.lightIntensity);
      gl.uniform1f(gl.getUniformLocation(programs.cloud, "u_ambientDarkness"), p.ambientDarkness);
      gl.uniform1i(gl.getUniformLocation(programs.cloud, "u_numLayers"), p.numLayers);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      swapBuffers();
    }

    // === PASS 3: Rain ===
    if (props.layers.rain && programs.rain) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFB.fbo);
      gl.viewport(0, 0, displayWidth, displayHeight);
      gl.useProgram(programs.rain);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readFB.texture);
      gl.uniform1i(gl.getUniformLocation(programs.rain, "u_sceneTexture"), 0);

      const p = props.rain;
      gl.uniform1f(gl.getUniformLocation(programs.rain, "u_time"), time);
      gl.uniform2f(gl.getUniformLocation(programs.rain, "u_resolution"), displayWidth, displayHeight);
      gl.uniform1f(gl.getUniformLocation(programs.rain, "u_glassIntensity"), p.glassIntensity);
      gl.uniform1f(gl.getUniformLocation(programs.rain, "u_glassZoom"), p.glassZoom);
      gl.uniform1f(gl.getUniformLocation(programs.rain, "u_fallingIntensity"), p.fallingIntensity);
      gl.uniform1f(gl.getUniformLocation(programs.rain, "u_fallingSpeed"), p.fallingSpeed);
      gl.uniform1f(gl.getUniformLocation(programs.rain, "u_fallingAngle"), p.fallingAngle);
      gl.uniform1f(gl.getUniformLocation(programs.rain, "u_fallingStreakLength"), p.fallingStreakLength);
      gl.uniform1i(gl.getUniformLocation(programs.rain, "u_fallingLayers"), p.fallingLayers);
      gl.uniform1f(gl.getUniformLocation(programs.rain, "u_refractionStrength"), props.interactions.rainRefractionStrength);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      swapBuffers();
    }

    // === PASS 4: Lightning ===
    if (props.layers.lightning && programs.lightning) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFB.fbo);
      gl.viewport(0, 0, displayWidth, displayHeight);
      gl.useProgram(programs.lightning);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readFB.texture);
      gl.uniform1i(gl.getUniformLocation(programs.lightning, "u_sceneTexture"), 0);

      const p = props.lightning;
      gl.uniform1f(gl.getUniformLocation(programs.lightning, "u_time"), time);
      gl.uniform2f(gl.getUniformLocation(programs.lightning, "u_resolution"), displayWidth, displayHeight);
      gl.uniform1i(gl.getUniformLocation(programs.lightning, "u_enabled"), p.enabled ? 1 : 0);
      gl.uniform1f(gl.getUniformLocation(programs.lightning, "u_flashIntensity"), p.flashIntensity);
      gl.uniform1f(gl.getUniformLocation(programs.lightning, "u_branchDensity"), p.branchDensity);
      gl.uniform1f(gl.getUniformLocation(programs.lightning, "u_sceneIllumination"), props.interactions.lightningSceneIllumination);
      gl.uniform1f(gl.getUniformLocation(programs.lightning, "u_lastFlashTime"), lastFlashTimeRef.current);
      gl.uniform1f(gl.getUniformLocation(programs.lightning, "u_strikeSeed"), strikeSeedRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      swapBuffers();
    }

    // === PASS 5: Snow ===
    if (props.layers.snow && programs.snow) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFB.fbo);
      gl.viewport(0, 0, displayWidth, displayHeight);
      gl.useProgram(programs.snow);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readFB.texture);
      gl.uniform1i(gl.getUniformLocation(programs.snow, "u_sceneTexture"), 0);

      const p = props.snow;
      gl.uniform1f(gl.getUniformLocation(programs.snow, "u_time"), time);
      gl.uniform2f(gl.getUniformLocation(programs.snow, "u_resolution"), displayWidth, displayHeight);
      gl.uniform1f(gl.getUniformLocation(programs.snow, "u_intensity"), p.intensity);
      gl.uniform1i(gl.getUniformLocation(programs.snow, "u_layers"), p.layers);
      gl.uniform1f(gl.getUniformLocation(programs.snow, "u_fallSpeed"), p.fallSpeed);
      gl.uniform1f(gl.getUniformLocation(programs.snow, "u_windSpeed"), p.windSpeed);
      gl.uniform1f(gl.getUniformLocation(programs.snow, "u_drift"), p.drift);
      gl.uniform1f(gl.getUniformLocation(programs.snow, "u_flakeSize"), p.flakeSize);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      swapBuffers();
    }

    // === Final: Render to screen ===
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, displayWidth, displayHeight);

    if (programs.composite) {
      gl.useProgram(programs.composite);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readFB.texture);
      gl.uniform1i(gl.getUniformLocation(programs.composite, "u_sceneTexture"), 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, []);

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
