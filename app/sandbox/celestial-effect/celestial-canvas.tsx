"use client";

import { useEffect, useRef, useCallback } from "react";

interface CelestialCanvasProps {
  className?: string;
  // Time
  timeOfDay?: number;
  animateTime?: boolean;
  dayDuration?: number;
  // Sun
  sunSize?: number;
  sunGlowIntensity?: number;
  sunGlowSize?: number;
  sunRaysEnabled?: boolean;
  sunRayCount?: number;
  sunRayLength?: number;
  // Moon
  moonSize?: number;
  moonPhase?: number;
  moonGlowIntensity?: number;
  moonGlowSize?: number;
  showCraters?: boolean;
  craterDetail?: number;
  // Sky
  horizonOffset?: number;
  atmosphereThickness?: number;
  starDensity?: number;
  // Debug
  showPath?: boolean;
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
uniform float u_timeOfDay;
uniform float u_sunSize;
uniform float u_sunGlowIntensity;
uniform float u_sunGlowSize;
uniform bool u_sunRaysEnabled;
uniform int u_sunRayCount;
uniform float u_sunRayLength;
uniform float u_moonSize;
uniform float u_moonPhase;
uniform float u_moonGlowIntensity;
uniform float u_moonGlowSize;
uniform bool u_showCraters;
uniform float u_craterDetail;
uniform float u_horizonOffset;
uniform float u_atmosphereThickness;
uniform float u_starDensity;
uniform bool u_showPath;
uniform bool u_debug;
uniform sampler2D u_moonTexture;
uniform bool u_hasMoonTexture;

#define PI 3.14159265359
#define TAU 6.28318530718

// ============================================================================
// NOISE FUNCTIONS
// ============================================================================

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
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

// ============================================================================
// CELESTIAL POSITIONS
// ============================================================================

vec2 getSunPosition(float timeOfDay, float horizonOffset) {
  // Sun follows an arc: rises in east (left), peaks at noon, sets in west (right)
  // angle spans 0 to PI as timeOfDay goes from 0.25 (sunrise) to 0.75 (sunset)
  float angle = (timeOfDay - 0.25) * 2.0 * PI;
  float x = 0.5 - cos(angle) * 0.4; // negative cos for left-to-right motion
  float y = horizonOffset + sin(angle) * 0.45;
  return vec2(x, y);
}

vec2 getMoonPosition(float timeOfDay, float horizonOffset) {
  // Moon is opposite the sun (offset by 0.5)
  float moonTime = fract(timeOfDay + 0.5);
  float angle = (moonTime - 0.25) * 2.0 * PI;
  float x = 0.5 - cos(angle) * 0.4; // negative cos for left-to-right motion
  float y = horizonOffset + sin(angle) * 0.45;
  return vec2(x, y);
}

float getSunVisibility(float timeOfDay) {
  // Sun visible from ~0.2 to ~0.8 (sunrise to sunset)
  float rise = smoothstep(0.2, 0.3, timeOfDay);
  float set = smoothstep(0.8, 0.7, timeOfDay);
  return rise * set;
}

float getMoonVisibility(float timeOfDay) {
  // Moon visible when sun is down
  float nightStart = smoothstep(0.7, 0.85, timeOfDay);
  float nightEnd = smoothstep(0.3, 0.15, timeOfDay);
  return max(nightStart, nightEnd);
}

// ============================================================================
// SKY GRADIENT
// ============================================================================

vec3 getSkyColor(vec2 uv, float timeOfDay, float atmosphereThickness) {
  // Time-based sky colors
  vec3 dayTop = vec3(0.4, 0.6, 0.9);
  vec3 dayHorizon = vec3(0.7, 0.8, 0.95);

  vec3 sunsetTop = vec3(0.2, 0.2, 0.4);
  vec3 sunsetHorizon = vec3(0.9, 0.5, 0.2);

  vec3 nightTop = vec3(0.02, 0.02, 0.05);
  vec3 nightHorizon = vec3(0.05, 0.05, 0.1);

  // Determine time of day blend
  float dayAmount = smoothstep(0.25, 0.4, timeOfDay) * smoothstep(0.75, 0.6, timeOfDay);
  float sunsetAmount = max(
    smoothstep(0.2, 0.3, timeOfDay) * smoothstep(0.4, 0.3, timeOfDay),
    smoothstep(0.6, 0.7, timeOfDay) * smoothstep(0.8, 0.7, timeOfDay)
  );
  float nightAmount = 1.0 - dayAmount - sunsetAmount;
  nightAmount = max(0.0, nightAmount);

  // Vertical gradient factor
  float gradientFactor = pow(1.0 - uv.y, atmosphereThickness);

  // Blend sky colors based on time
  vec3 topColor = dayTop * dayAmount + sunsetTop * sunsetAmount + nightTop * nightAmount;
  vec3 horizonColor = dayHorizon * dayAmount + sunsetHorizon * sunsetAmount + nightHorizon * nightAmount;

  return mix(topColor, horizonColor, gradientFactor);
}

// ============================================================================
// STARS
// ============================================================================

float drawStars(vec2 uv, float density, float time) {
  float stars = 0.0;

  // Multiple star layers for depth
  for (int layer = 0; layer < 3; layer++) {
    float layerScale = 100.0 + float(layer) * 50.0;
    vec2 gridUV = uv * layerScale;
    vec2 gridID = floor(gridUV);
    vec2 gridFract = fract(gridUV);

    // Random star position within grid cell
    vec2 starOffset = hash2(gridID + float(layer) * 100.0);
    vec2 starPos = starOffset;

    float dist = length(gridFract - starPos);

    // Star visibility based on density
    float starPresent = step(1.0 - density * 0.3, hash(gridID * (float(layer) + 1.0)));

    // Star size varies
    float starSize = 0.02 + hash(gridID.yx) * 0.03;

    // Twinkle
    float twinkle = sin(time * (2.0 + hash(gridID) * 3.0) + hash(gridID.yx) * TAU) * 0.3 + 0.7;

    // Star brightness
    float star = smoothstep(starSize, 0.0, dist) * starPresent * twinkle;

    // Dimmer stars in background layers
    star *= 1.0 - float(layer) * 0.3;

    stars += star;
  }

  return stars;
}

// ============================================================================
// SUN
// ============================================================================

vec3 drawSun(vec2 uv, vec2 sunPos, float size, float glowIntensity, float glowSize,
             bool showRays, int rayCount, float rayLength, float time) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 diff = (uv - sunPos) * aspect;
  float dist = length(diff);

  // Core sun disc - inverted smoothstep for correct falloff
  float disc = 1.0 - smoothstep(size * 0.9, size, dist);

  // Sun color gradient (white center to yellow edge)
  vec3 sunCore = vec3(1.0, 1.0, 0.95);
  vec3 sunEdge = vec3(1.0, 0.9, 0.4);
  float edgeFactor = clamp(dist / size, 0.0, 1.0);
  vec3 sunColor = mix(sunCore, sunEdge, edgeFactor);

  // Limb darkening effect
  float limbDarkening = 1.0 - pow(clamp(dist / size, 0.0, 1.0), 2.0) * 0.3;
  sunColor *= limbDarkening;

  // Glow layers - scale by glowSize
  float scaledDist = dist / (glowSize * 0.1);
  float glow1 = exp(-scaledDist * 8.0) * glowIntensity * 0.5;
  float glow2 = exp(-scaledDist * 3.0) * glowIntensity * 0.3;
  float glow3 = exp(-scaledDist * 1.5) * glowIntensity * 0.15;

  vec3 glowColor = vec3(1.0, 0.8, 0.4);

  // Sun rays
  float rays = 0.0;
  if (showRays && dist > size * 0.5) {
    float angle = atan(diff.y, diff.x);
    float rayPattern = sin(angle * float(rayCount) + time * 0.5) * 0.5 + 0.5;
    rayPattern = pow(rayPattern, 3.0);

    float rayFalloff = exp(-dist / (rayLength * 0.5));
    rays = rayPattern * rayFalloff * 0.4 * glowIntensity;
  }

  // Combine - disc is additive bright white/yellow
  vec3 result = sunColor * disc * 2.0;
  result += glowColor * (glow1 + glow2 + glow3);
  result += vec3(1.0, 0.9, 0.6) * rays;

  return result;
}

// ============================================================================
// MOON - 3D sphere with real texture and proper lighting
// ============================================================================

// Get 3D sphere normal from 2D disc position
vec3 getSphereNormal(vec2 discUV) {
  float r2 = dot(discUV, discUV);
  if (r2 > 1.0) return vec3(0.0);
  float z = sqrt(1.0 - r2);
  return normalize(vec3(discUV.x, discUV.y, z));
}

// Convert sphere normal to equirectangular UV for texture sampling
vec2 sphereToEquirectangular(vec3 normal) {
  // Longitude: atan2(x, z) gives angle around Y axis
  // We offset by 0.5 to center the near side of the moon
  float longitude = atan(normal.x, normal.z);
  float u = longitude / TAU + 0.5;

  // Latitude: asin(y) gives angle from equator
  float latitude = asin(clamp(normal.y, -1.0, 1.0));
  float v = latitude / PI + 0.5;

  return vec2(u, v);
}

// Sample moon surface color from texture or procedural fallback
vec3 getMoonSurfaceColor(vec3 normal, vec2 discUV) {
  if (u_hasMoonTexture) {
    vec2 texUV = sphereToEquirectangular(normal);
    vec3 texColor = texture(u_moonTexture, texUV).rgb;
    return texColor;
  }

  // Procedural fallback if texture not loaded
  float brightness = 0.7 + fbm(discUV * 5.0, 3) * 0.3;
  return vec3(brightness * 0.85, brightness * 0.83, brightness * 0.8);
}

vec4 drawMoon(vec2 uv, vec2 moonPos, float size, float phase, float glowIntensity,
              float glowSize, bool showCraters, float craterDetail, float time) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 diff = (uv - moonPos) * aspect;
  float dist = length(diff);

  // Normalized position on moon disc (-1 to 1)
  vec2 discUV = diff / size;
  float discDist = length(discUV);

  // Smooth disc edge
  float disc = 1.0 - smoothstep(0.95, 1.0, discDist);

  if (disc < 0.001) {
    // Outside moon, just render glow (alpha = 0, additive glow)
    float scaledDist = dist / (glowSize * 0.08);
    float glow1 = exp(-scaledDist * 6.0) * glowIntensity * 0.25;
    float glow2 = exp(-scaledDist * 2.0) * glowIntensity * 0.1;
    vec3 glowColor = vec3(0.8, 0.85, 0.95);

    // Glow follows illuminated portion
    float phaseAngle = phase * TAU;
    vec3 sunDir = vec3(sin(phaseAngle), 0.0, -cos(phaseAngle));
    float glowPhase = max(0.2, dot(normalize(vec3(discUV, 0.5)), sunDir) * 0.5 + 0.5);

    return vec4(glowColor * (glow1 + glow2) * glowPhase, 0.0);
  }

  // === 3D SPHERE LIGHTING ===
  // Get surface normal on the sphere
  vec3 normal = getSphereNormal(discUV);

  // Sun direction based on phase (direction light comes FROM)
  // phase 0 = new moon: sun behind moon, light comes from -Z (away from viewer)
  // phase 0.25 = first quarter: sun to the right, light comes from +X
  // phase 0.5 = full moon: sun behind viewer, light comes from +Z (toward moon)
  // phase 0.75 = third quarter: sun to the left, light comes from -X
  float phaseAngle = phase * TAU;
  vec3 sunDir = vec3(sin(phaseAngle), 0.0, -cos(phaseAngle));

  // Basic lambertian lighting
  float NdotL = dot(normal, sunDir);

  // Terminator softness for realistic shadow edge
  float terminator = smoothstep(-0.02, 0.08, NdotL);

  // === LUNAR SURFACE FROM TEXTURE ===
  vec3 baseColor = getMoonSurfaceColor(normal, discUV);

  // === LIGHTING APPLICATION ===
  // Ambient light (earthshine on dark side)
  vec3 ambient = baseColor * 0.03;

  // Direct sunlight
  vec3 lit = baseColor * terminator;

  // Combine
  vec3 moonSurface = ambient + lit;

  // === LIMB DARKENING ===
  // Moon appears slightly darker at edges due to viewing angle
  float limbDarkening = 1.0 - pow(discDist, 3.0) * 0.15;
  moonSurface *= limbDarkening;

  // === SUBTLE RIM LIGHT ===
  // Very subtle bright edge where sun grazes the surface
  float rimLight = pow(1.0 - abs(NdotL), 4.0) * terminator * 0.1;
  moonSurface += vec3(1.0, 0.98, 0.95) * rimLight;

  // === GLOW ===
  float scaledDist = dist / (glowSize * 0.08);
  float glow1 = exp(-scaledDist * 6.0) * glowIntensity * 0.2;
  float glow2 = exp(-scaledDist * 2.0) * glowIntensity * 0.1;
  vec3 glowColor = vec3(0.8, 0.85, 0.95);

  // Glow intensity based on how much of moon is lit
  float litAmount = max(0.1, terminator);

  vec3 result = moonSurface;
  vec3 glow = glowColor * (glow1 + glow2) * litAmount;

  // Return moon surface with disc alpha, plus additive glow
  return vec4(result * disc + glow, disc);
}

// ============================================================================
// DEBUG
// ============================================================================

vec3 drawOrbitalPath(vec2 uv, float horizonOffset) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);

  // Draw the semicircular arc the sun/moon follows
  // The arc goes from (0.1, horizonOffset) to (0.9, horizonOffset) with peak at (0.5, horizonOffset + 0.45)
  vec2 arcCenter = vec2(0.5, horizonOffset);
  vec2 diff = (uv - arcCenter) * aspect;

  // Semi-elliptical path (upper half only)
  float ellipseX = diff.x / 0.4;
  float ellipseY = diff.y / 0.45;
  float ellipseDist = abs(length(vec2(ellipseX, ellipseY)) - 1.0);

  // Only show upper half of the ellipse (where sun/moon actually travels)
  float upperHalf = step(0.0, diff.y);
  float path = smoothstep(0.02, 0.01, ellipseDist) * upperHalf;

  // Horizon line
  float horizon = smoothstep(0.005, 0.002, abs(uv.y - horizonOffset));

  return vec3(0.3, 0.3, 0.5) * path + vec3(0.5, 0.3, 0.3) * horizon;
}

// ============================================================================
// MAIN
// ============================================================================

void main() {
  vec2 uv = v_uv;

  // Get sky background
  vec3 color = getSkyColor(uv, u_timeOfDay, u_atmosphereThickness);

  // Stars (only visible at night)
  float nightFactor = getMoonVisibility(u_timeOfDay);
  if (nightFactor > 0.01) {
    float stars = drawStars(uv, u_starDensity, u_time);
    color += vec3(stars) * nightFactor;
  }

  // Debug orbital path
  if (u_showPath) {
    color += drawOrbitalPath(uv, u_horizonOffset);
  }

  // Sun
  float sunVis = getSunVisibility(u_timeOfDay);
  if (sunVis > 0.01) {
    vec2 sunPos = getSunPosition(u_timeOfDay, u_horizonOffset);
    vec3 sun = drawSun(uv, sunPos, u_sunSize, u_sunGlowIntensity, u_sunGlowSize,
                       u_sunRaysEnabled, u_sunRayCount, u_sunRayLength, u_time);
    color += sun * sunVis;
  }

  // Moon
  float moonVis = getMoonVisibility(u_timeOfDay);
  if (moonVis > 0.01) {
    vec2 moonPos = getMoonPosition(u_timeOfDay, u_horizonOffset);
    vec4 moon = drawMoon(uv, moonPos, u_moonSize, u_moonPhase, u_moonGlowIntensity,
                         u_moonGlowSize, u_showCraters, u_craterDetail, u_time);
    // Proper compositing: blend moon disc over background, add glow
    float alpha = moon.a * moonVis;
    color = mix(color, moon.rgb, alpha) + moon.rgb * (1.0 - moon.a) * moonVis;
  }

  // Debug info
  if (u_debug) {
    // Show time value
    if (uv.x < 0.1 && uv.y > 0.95) {
      color = vec3(u_timeOfDay, 0.0, 0.0);
    }
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

export function CelestialCanvas({
  className,
  timeOfDay = 0.5,
  animateTime = false,
  dayDuration = 60,
  sunSize = 0.08,
  sunGlowIntensity = 1.0,
  sunGlowSize = 3.0,
  sunRaysEnabled = true,
  sunRayCount = 12,
  sunRayLength = 0.3,
  moonSize = 0.06,
  moonPhase = 0.5,
  moonGlowIntensity = 0.6,
  moonGlowSize = 2.5,
  showCraters = true,
  craterDetail = 0.5,
  horizonOffset = 0.1,
  atmosphereThickness = 1.0,
  starDensity = 0.5,
  showPath = false,
  debug = false,
}: CelestialCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const animatedTimeRef = useRef<number>(timeOfDay);
  const moonTextureRef = useRef<WebGLTexture | null>(null);
  const moonTextureLoadedRef = useRef<boolean>(false);

  // Store props in refs so render loop doesn't need to be recreated
  const propsRef = useRef({
    timeOfDay, animateTime, dayDuration,
    sunSize, sunGlowIntensity, sunGlowSize, sunRaysEnabled, sunRayCount, sunRayLength,
    moonSize, moonPhase, moonGlowIntensity, moonGlowSize, showCraters, craterDetail,
    horizonOffset, atmosphereThickness, starDensity, showPath, debug
  });

  // Update props ref when props change (no re-render needed)
  propsRef.current = {
    timeOfDay, animateTime, dayDuration,
    sunSize, sunGlowIntensity, sunGlowSize, sunRaysEnabled, sunRayCount, sunRayLength,
    moonSize, moonPhase, moonGlowIntensity, moonGlowSize, showCraters, craterDetail,
    horizonOffset, atmosphereThickness, starDensity, showPath, debug
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

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return false;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;
    programRef.current = program;

    // Get all uniform locations
    const uniformNames = [
      "u_time", "u_resolution", "u_timeOfDay",
      "u_sunSize", "u_sunGlowIntensity", "u_sunGlowSize",
      "u_sunRaysEnabled", "u_sunRayCount", "u_sunRayLength",
      "u_moonSize", "u_moonPhase", "u_moonGlowIntensity", "u_moonGlowSize",
      "u_showCraters", "u_craterDetail",
      "u_horizonOffset", "u_atmosphereThickness", "u_starDensity",
      "u_showPath", "u_debug",
      "u_moonTexture", "u_hasMoonTexture"
    ];

    uniformNames.forEach(name => {
      uniformsRef.current[name] = gl.getUniformLocation(program, name);
    });

    // Load moon texture
    const moonTexture = gl.createTexture();
    moonTextureRef.current = moonTexture;
    gl.bindTexture(gl.TEXTURE_2D, moonTexture);

    // Placeholder 1x1 pixel until image loads
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));

    const moonImage = new Image();
    moonImage.crossOrigin = "anonymous";
    moonImage.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, moonTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, moonImage);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      moonTextureLoadedRef.current = true;
    };
    moonImage.src = "/assets/moon-texture.jpg";

    // Set up geometry
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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
    const props = propsRef.current;

    if (!gl || !program || !canvas) return;

    const displayWidth = canvas.clientWidth * window.devicePixelRatio;
    const displayHeight = canvas.clientHeight * window.devicePixelRatio;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    const time = (performance.now() - startTimeRef.current) / 1000;

    // Animate time if enabled
    if (props.animateTime) {
      animatedTimeRef.current = (time / props.dayDuration) % 1.0;
    } else {
      animatedTimeRef.current = props.timeOfDay;
    }

    gl.useProgram(program);

    // Set uniforms
    gl.uniform1f(uniforms.u_time, time);
    gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.u_timeOfDay, animatedTimeRef.current);
    gl.uniform1f(uniforms.u_sunSize, props.sunSize);
    gl.uniform1f(uniforms.u_sunGlowIntensity, props.sunGlowIntensity);
    gl.uniform1f(uniforms.u_sunGlowSize, props.sunGlowSize);
    gl.uniform1i(uniforms.u_sunRaysEnabled, props.sunRaysEnabled ? 1 : 0);
    gl.uniform1i(uniforms.u_sunRayCount, props.sunRayCount);
    gl.uniform1f(uniforms.u_sunRayLength, props.sunRayLength);
    gl.uniform1f(uniforms.u_moonSize, props.moonSize);
    gl.uniform1f(uniforms.u_moonPhase, props.moonPhase);
    gl.uniform1f(uniforms.u_moonGlowIntensity, props.moonGlowIntensity);
    gl.uniform1f(uniforms.u_moonGlowSize, props.moonGlowSize);
    gl.uniform1i(uniforms.u_showCraters, props.showCraters ? 1 : 0);
    gl.uniform1f(uniforms.u_craterDetail, props.craterDetail);
    gl.uniform1f(uniforms.u_horizonOffset, props.horizonOffset);
    gl.uniform1f(uniforms.u_atmosphereThickness, props.atmosphereThickness);
    gl.uniform1f(uniforms.u_starDensity, props.starDensity);
    gl.uniform1i(uniforms.u_showPath, props.showPath ? 1 : 0);
    gl.uniform1i(uniforms.u_debug, props.debug ? 1 : 0);

    // Bind moon texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, moonTextureRef.current);
    gl.uniform1i(uniforms.u_moonTexture, 0);
    gl.uniform1i(uniforms.u_hasMoonTexture, moonTextureLoadedRef.current ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(render);
  }, []); // No dependencies - reads from refs

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
