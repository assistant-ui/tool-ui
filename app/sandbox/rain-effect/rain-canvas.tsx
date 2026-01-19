"use client";

import { useEffect, useRef, useCallback } from "react";

interface RainCanvasProps {
  className?: string;
  // Glass drops (rain on window)
  glassIntensity?: number;
  zoom?: number;
  // Falling rain (rain in the air)
  fallingIntensity?: number;
  fallingSpeed?: number;
  fallingAngle?: number;
  fallingStreakLength?: number;
  fallingLayers?: number;
  fallingRefraction?: number;
  fallingWaviness?: number;
  fallingThicknessVar?: number;
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

// Inspired by "Heartfelt" by Martijn Steinrucken aka BigWings
// Original: https://www.shadertoy.com/view/ltffzl
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_glassIntensity;
uniform float u_zoom;
uniform float u_fallingIntensity;
uniform float u_fallingSpeed;
uniform float u_fallingAngle;
uniform float u_fallingStreakLength;
uniform int u_fallingLayers;
uniform float u_fallingRefraction;
uniform float u_fallingWaviness;
uniform float u_fallingThicknessVar;
uniform bool u_debug;

#define S(a, b, t) smoothstep(a, b, t)

// ============================================================================
// NOISE FUNCTIONS
// ============================================================================

// 3D noise from 1D input
vec3 N13(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

// Simple 1D noise
float N(float t) {
  return fract(sin(t * 12345.564) * 7658.76);
}

// Saw wave - ramps up then down
float Saw(float b, float t) {
  return S(0.0, b, t) * S(1.0, b, t);
}

// 2D noise for background
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// FBM for richer textures
float fbm(vec2 p) {
  float f = 0.0;
  float w = 0.5;
  for (int i = 0; i < 4; i++) {
    f += w * noise2D(p);
    p *= 2.0;
    w *= 0.5;
  }
  return f;
}

// ============================================================================
// BACKGROUND - Rainy night city
// ============================================================================

vec3 cityLights(vec2 uv) {
  vec3 color = vec3(0.0);

  // Dark sky gradient
  vec3 skyTop = vec3(0.02, 0.03, 0.06);
  vec3 skyBottom = vec3(0.01, 0.015, 0.025);
  color = mix(skyBottom, skyTop, uv.y);

  // Horizon glow
  float horizonGlow = exp(-pow((uv.y - 0.15) * 4.0, 2.0));
  color += vec3(0.15, 0.08, 0.05) * horizonGlow * 0.5;

  // Atmospheric haze
  float fog = fbm(uv * 3.0 + u_time * 0.02) * 0.08;
  color += vec3(0.04, 0.05, 0.07) * fog;

  return color;
}

// ============================================================================
// ANIMATED DROP LAYER (with trails)
// ============================================================================

vec2 DropLayer(vec2 uv, float t) {
  vec2 UV = uv;

  // Scroll down
  uv.y += t * 0.75;

  // Grid setup - wider cells horizontally
  vec2 aspect = vec2(6.0, 1.0);
  vec2 grid = aspect * 2.0;
  vec2 id = floor(uv * grid);

  // Shift columns for variation
  float colShift = N(id.x);
  uv.y += colShift;

  // Recalculate ID after shift
  id = floor(uv * grid);
  vec3 n = N13(id.x * 35.2 + id.y * 2376.1);

  // Position within cell
  vec2 st = fract(uv * grid) - vec2(0.5, 0.0);

  // Drop horizontal position with wiggle
  float x = n.x - 0.5;
  float y = UV.y * 20.0;

  // Organic wiggle motion: sin(y + sin(y)) creates natural sway
  float wiggle = sin(y + sin(y));
  x += wiggle * (0.5 - abs(x)) * (n.z - 0.5);
  x *= 0.7;

  // Temporal animation - drop falls and resets
  float ti = fract(t + n.z);
  y = (Saw(0.85, ti) - 0.5) * 0.9 + 0.5;

  vec2 p = vec2(x, y);

  // Main drop shape
  float d = length((st - p) * aspect.yx);
  float mainDrop = S(0.4, 0.0, d);

  // Trail behind the drop
  float r = sqrt(S(1.0, y, st.y));
  float cd = abs(st.x - x);
  float trail = S(0.23 * r, 0.15 * r * r, cd);
  float trailFront = S(-0.02, 0.02, st.y - y);
  trail *= trailFront * r * r;

  // Secondary droplets along the trail
  float y2 = UV.y;
  float trail2 = S(0.2 * r, 0.0, cd);
  float droplets = max(0.0, (sin(y2 * (1.0 - y2) * 120.0) - st.y)) * trail2 * trailFront * n.z;

  // Small drops along trail
  y2 = fract(y2 * 10.0) + (st.y - 0.5);
  float dd = length(st - vec2(x, y2));
  droplets = S(0.3, 0.0, dd);

  float m = mainDrop + droplets * r * trailFront;

  return vec2(m, trail);
}

// ============================================================================
// STATIC DROPS (small stationary drops on glass)
// ============================================================================

float StaticDrops(vec2 uv, float t) {
  uv *= 40.0;

  vec2 id = floor(uv);
  uv = fract(uv) - 0.5;

  vec3 n = N13(id.x * 107.45 + id.y * 3543.654);
  vec2 p = (n.xy - 0.5) * 0.7;

  float d = length(uv - p);

  // Pulse in and out
  float fade = Saw(0.025, fract(t + n.z));
  float c = S(0.3, 0.0, d) * fract(n.z * 10.0) * fade;

  return c;
}

// ============================================================================
// COMBINED DROPS (Glass effect)
// ============================================================================

vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
  // Static drops
  float s = StaticDrops(uv, t) * l0;

  // Two animated layers at different scales
  vec2 m1 = DropLayer(uv, t) * l1;
  vec2 m2 = DropLayer(uv * 1.85, t) * l2;

  // Combine
  float c = s + m1.x + m2.x;
  c = S(0.3, 1.0, c);

  return vec2(c, max(m1.y * l0, m2.y * l1));
}

// ============================================================================
// FALLING RAIN (Rain streaks in the air)
// ============================================================================

// Hash function for pseudo-random values
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


// Attempt a streak hit with organic shape
// Returns: x = refraction offset, y = streak mask
vec2 OrganicStreak(vec2 localUV, float streakH, float baseWidth, float seed, float seed2) {
  vec2 d = localUV;

  // Normalize position along streak (0 = top, 1 = bottom)
  float t = (d.y + streakH) / (2.0 * streakH);
  t = clamp(t, 0.0, 1.0);

  // Early exit if clearly outside
  if (abs(d.y) > streakH * 1.2) return vec2(0.0);

  // === WAVY PATH ===
  // Streak doesn't fall straight - has slight S-curve wiggle
  float waveFreq = 2.0 + seed * 3.0;
  float waveAmp = baseWidth * (1.0 + seed2 * 2.0) * u_fallingWaviness;
  float wave = sin(t * waveFreq * 3.14159 + seed * 10.0) * waveAmp;
  d.x -= wave;

  // === VARIABLE THICKNESS ===
  // Width varies along length: thicker near top, thinner at bottom, with noise
  float taper = mix(1.3, 0.4, t * t); // Basic taper
  float thicknessNoiseAmt = 0.2 * u_fallingThicknessVar;
  float thicknessNoise = sin(t * 15.0 + seed * 20.0) * thicknessNoiseAmt + 1.0;
  float width = baseWidth * taper * thicknessNoise;

  // === CORE SHAPE ===
  // Soft-edged streak
  float coreDist = abs(d.x);
  float core = S(width, width * 0.2, coreDist);

  // Vertical bounds: soft fade at top and bottom
  float vertFade = S(0.0, 0.1, t) * S(1.0, 0.85, t);

  // === INTERNAL BRIGHTNESS VARIATION ===
  // Simulates light refracting through oscillating raindrop
  float oscillation = sin(t * 25.0 + seed * 30.0) * 0.25 + 0.75;
  float speckle = sin(t * 60.0 + seed2 * 50.0) * 0.15 + 0.85;

  // === BREAK INTO SEGMENTS ===
  // Some streaks appear broken/dotted (especially longer ones)
  float breakup = 1.0;
  if (seed > 0.6) {
    // This streak has gaps
    float gapPattern = sin(t * 8.0 + seed * 15.0);
    breakup = S(-0.3, 0.1, gapPattern);
  }

  // === BRIGHT HEAD ===
  // The leading edge (top) of the drop catches more light
  float headBrightness = S(0.15, 0.0, t) * 1.5;

  // Combine all factors
  float streak = core * vertFade * oscillation * speckle * breakup;
  streak += headBrightness * core * S(0.2, 0.0, t);
  streak = clamp(streak, 0.0, 1.0);

  // Refraction direction based on position relative to wavy center
  float refract = d.x * streak;

  return vec2(refract, streak);
}

// Falling rain layer with organic streaks
vec2 FallingRainLayer(vec2 uv, float t, float speed, float windAngle, float streakLen, float scale, float density) {
  vec2 offset = vec2(0.0);

  // Apply wind shear
  vec2 p = uv;
  p.x += p.y * windAngle;

  // Scale and scroll
  p *= scale;
  p.y += t * speed;

  // Grid
  vec2 id = floor(p);
  vec2 gv = fract(p) - 0.5;

  // Check neighboring cells
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      vec2 cellId = id + offs;

      // Random values for this cell
      float n1 = hash12(cellId);
      vec2 n2 = hash22(cellId * 17.23);
      float n3 = hash12(cellId * 31.17);

      // Skip based on density
      if (n1 > density) continue;

      // Drop position within cell
      vec2 dropPos = offs + n2 - 0.5;

      // Local coordinates relative to drop
      vec2 localUV = gv - dropPos;

      // Streak dimensions with variation
      float streakW = 0.025 + n1 * 0.02;
      float streakH = streakLen * (0.4 + n3 * 0.6);

      // Get organic streak
      vec2 result = OrganicStreak(localUV, streakH, streakW, n1, n3);

      if (result.y > 0.001) {
        offset.x += result.x * 0.5;
        offset.y += (n1 - 0.5) * result.y * 0.1;
      }
    }
  }

  return offset;
}

// Returns refraction offset for falling rain (to distort background sampling)
vec2 FallingRain(vec2 uv, float t) {
  vec2 totalOffset = vec2(0.0);

  if (u_fallingIntensity < 0.01) return totalOffset;

  float speed = u_fallingSpeed * 5.0;
  float windAngle = u_fallingAngle;
  float streakLen = u_fallingStreakLength * 0.3;
  float intensity = u_fallingIntensity;

  int layers = u_fallingLayers;

  // Multiple depth layers
  for (int i = 0; i < 6; i++) {
    if (i >= layers) break;

    float layerIdx = float(i);
    float depth = layerIdx / float(max(layers - 1, 1));

    // Layer parameters: closer = larger streaks, faster, denser, more refraction
    float layerScale = mix(6.0, 30.0, depth);
    float layerSpeed = speed * mix(2.0, 0.5, depth);
    float layerDensity = intensity * mix(0.8, 0.3, depth);
    float layerStrength = mix(1.0, 0.15, depth);
    float layerStreakLen = streakLen * mix(1.5, 0.4, depth);
    float layerAngle = windAngle * mix(1.0, 0.6, depth);

    // Unique offset per layer to prevent alignment
    vec2 layerOffset = vec2(
      sin(layerIdx * 73.156) * 3.0,
      cos(layerIdx * 37.842) * 3.0
    );

    vec2 layer = FallingRainLayer(
      uv + layerOffset,
      t + layerIdx * 0.13,
      layerSpeed,
      layerAngle,
      layerStreakLen,
      layerScale,
      layerDensity
    );

    totalOffset += layer * layerStrength;
  }

  // Scale refraction to screen space - controlled by uniform
  return totalOffset * u_fallingRefraction;
}

// ============================================================================
// MAIN
// ============================================================================

void main() {
  // Normalized coordinates centered at origin
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  vec2 UV = gl_FragCoord.xy / u_resolution.xy;

  // Apply zoom
  uv *= u_zoom;

  float t = u_time * 0.2;

  // Glass drops intensity
  float rainAmount = u_glassIntensity;

  // Layer intensities based on rain amount
  float staticDrops = S(-0.5, 1.0, rainAmount) * 2.0;
  float layer1 = S(0.25, 0.75, rainAmount);
  float layer2 = S(0.0, 0.5, rainAmount);

  // Calculate glass drops
  vec2 c = Drops(uv, t, staticDrops, layer1, layer2);

  // Calculate normals by sampling at offsets (gradient-based) for glass drops
  vec2 e = vec2(0.001, 0.0);
  float cx = Drops(uv + e, t, staticDrops, layer1, layer2).x;
  float cy = Drops(uv + e.yx, t, staticDrops, layer1, layer2).x;
  vec2 glassNormal = vec2(cx - c.x, cy - c.x);

  // Get falling rain refraction offset
  vec2 fallingRainOffset = FallingRain(uv, u_time);

  // Combine refractions: glass drops + falling rain
  vec2 totalRefraction = glassNormal + fallingRainOffset;

  // Sample background with combined refraction
  vec2 refractedUV = UV + totalRefraction;
  refractedUV = clamp(refractedUV, 0.0, 1.0);

  vec3 color = cityLights(refractedUV);

  // Falling rain creates subtle specular highlights where it refracts light
  // This makes rain visible even against dark backgrounds
  float rainMagnitude = length(fallingRainOffset);
  if (rainMagnitude > 0.001) {
    // Sample what's being refracted - if it's bright, the rain catches that light
    vec3 refractedLight = cityLights(refractedUV);
    float brightness = dot(refractedLight, vec3(0.299, 0.587, 0.114));

    // Subtle specular highlight - brighter where refracting bright areas
    float specular = rainMagnitude * 15.0 * (0.1 + brightness * 0.9);
    color += vec3(0.8, 0.85, 0.95) * specular * 0.3;
  }

  // Add slight brightness to glass drops themselves
  color += vec3(0.1, 0.12, 0.15) * c.x * 0.5;

  // Debug mode
  if (u_debug) {
    // Show grid
    vec2 grid = fract(uv * 12.0);
    float gridLines = step(0.98, grid.x) + step(0.98, grid.y);
    color = mix(color, vec3(1.0, 0.0, 0.0), gridLines * 0.3);

    // Show normals (combined refraction)
    color.rg += abs(totalRefraction) * 50.0;

    // Show drop mask
    color.b += c.x * 0.5;
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

export function RainCanvas({
  className,
  glassIntensity = 0.5,
  zoom = 1.0,
  fallingIntensity = 0.6,
  fallingSpeed = 1.0,
  fallingAngle = 0.1,
  fallingStreakLength = 1.0,
  fallingLayers = 4,
  fallingRefraction = 0.4,
  fallingWaviness = 1.0,
  fallingThicknessVar = 1.0,
  debug = false,
}: RainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    glassIntensity: WebGLUniformLocation | null;
    zoom: WebGLUniformLocation | null;
    fallingIntensity: WebGLUniformLocation | null;
    fallingSpeed: WebGLUniformLocation | null;
    fallingAngle: WebGLUniformLocation | null;
    fallingStreakLength: WebGLUniformLocation | null;
    fallingLayers: WebGLUniformLocation | null;
    fallingRefraction: WebGLUniformLocation | null;
    fallingWaviness: WebGLUniformLocation | null;
    fallingThicknessVar: WebGLUniformLocation | null;
    debug: WebGLUniformLocation | null;
  } | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

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
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER
    );
    if (!vertexShader || !fragmentShader) return false;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;
    programRef.current = program;

    uniformsRef.current = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      glassIntensity: gl.getUniformLocation(program, "u_glassIntensity"),
      zoom: gl.getUniformLocation(program, "u_zoom"),
      fallingIntensity: gl.getUniformLocation(program, "u_fallingIntensity"),
      fallingSpeed: gl.getUniformLocation(program, "u_fallingSpeed"),
      fallingAngle: gl.getUniformLocation(program, "u_fallingAngle"),
      fallingStreakLength: gl.getUniformLocation(program, "u_fallingStreakLength"),
      fallingLayers: gl.getUniformLocation(program, "u_fallingLayers"),
      fallingRefraction: gl.getUniformLocation(program, "u_fallingRefraction"),
      fallingWaviness: gl.getUniformLocation(program, "u_fallingWaviness"),
      fallingThicknessVar: gl.getUniformLocation(program, "u_fallingThicknessVar"),
      debug: gl.getUniformLocation(program, "u_debug"),
    };

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
    gl.uniform1f(uniforms.glassIntensity, glassIntensity);
    gl.uniform1f(uniforms.zoom, zoom);
    gl.uniform1f(uniforms.fallingIntensity, fallingIntensity);
    gl.uniform1f(uniforms.fallingSpeed, fallingSpeed);
    gl.uniform1f(uniforms.fallingAngle, fallingAngle);
    gl.uniform1f(uniforms.fallingStreakLength, fallingStreakLength);
    gl.uniform1i(uniforms.fallingLayers, fallingLayers);
    gl.uniform1f(uniforms.fallingRefraction, fallingRefraction);
    gl.uniform1f(uniforms.fallingWaviness, fallingWaviness);
    gl.uniform1f(uniforms.fallingThicknessVar, fallingThicknessVar);
    gl.uniform1i(uniforms.debug, debug ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [glassIntensity, zoom, fallingIntensity, fallingSpeed, fallingAngle, fallingStreakLength, fallingLayers, fallingRefraction, fallingWaviness, fallingThicknessVar, debug]);

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
