"use client";

import { useEffect, useRef, useCallback } from "react";

interface SnowCanvasProps {
  className?: string;
  // Density
  intensity?: number;
  layers?: number;
  // Motion
  fallSpeed?: number;
  windSpeed?: number;
  windAngle?: number;
  turbulence?: number;
  drift?: number;
  flutter?: number;
  windShear?: number;
  // Appearance
  flakeSize?: number;
  sizeVariation?: number;
  opacity?: number;
  glowAmount?: number;
  sparkle?: number;
  // Blizzard
  visibility?: number;
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
uniform float u_intensity;
uniform int u_layers;
uniform float u_fallSpeed;
uniform float u_windSpeed;
uniform float u_windAngle;
uniform float u_turbulence;
uniform float u_drift;
uniform float u_flutter;
uniform float u_windShear;
uniform float u_flakeSize;
uniform float u_sizeVariation;
uniform float u_opacity;
uniform float u_glowAmount;
uniform float u_sparkle;
uniform float u_visibility;
uniform bool u_debug;

#define PI 3.14159265359
#define MAX_LAYERS 6

// ============================================================================
// NOISE FUNCTIONS
// ============================================================================

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

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// ============================================================================
// 2D ROTATION
// ============================================================================

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

// ============================================================================
// SNOWFLAKE SHAPE (with rotation)
// ============================================================================

float snowflakeShape(vec2 uv, float size, float seed, float rotation) {
  // Apply rotation to UV
  vec2 rotatedUV = rotate2D(uv, rotation);

  float dist = length(rotatedUV);

  // Base soft circle
  float circle = smoothstep(size, size * 0.3, dist);

  // Add subtle 6-fold symmetry for larger flakes
  float angle = atan(rotatedUV.y, rotatedUV.x);
  float hexPattern = 0.5 + 0.5 * cos(angle * 6.0);
  hexPattern = pow(hexPattern, 2.0);

  // Mix based on flake size (larger = more crystalline)
  float crystalAmount = smoothstep(0.02, 0.05, size) * 0.3;
  float shape = mix(circle, circle * (0.7 + hexPattern * 0.3), crystalAmount);

  // Soft glow (uses non-rotated distance for circular glow)
  float glow = exp(-dist * dist / (size * size * 3.0)) * u_glowAmount;

  return shape + glow * 0.4;
}

// ============================================================================
// WIND & TURBULENCE
// ============================================================================

vec2 getWind(vec2 uv, float time, float layerDepth, float flakeSize) {
  // Base wind direction
  vec2 baseWind = vec2(cos(u_windAngle), 0.0) * u_windSpeed;

  // Turbulent gusts - vary by position and time
  float gustFreq = 0.5 + u_turbulence;
  float gust = noise(uv * gustFreq + time * 0.2) * 2.0 - 1.0;

  // Add turbulent eddies
  vec2 eddy = vec2(
    noise(uv * 2.0 + time * 0.3 + vec2(0.0, 100.0)) - 0.5,
    noise(uv * 2.0 + time * 0.3 + vec2(100.0, 0.0)) - 0.5
  ) * u_turbulence * 0.5;

  // Wind shear: wind increases with height (creates curved fall paths)
  float heightFactor = 1.0 + uv.y * u_windShear;

  // Deeper layers (background) respond less to wind
  float windResponse = mix(0.3, 1.0, 1.0 - layerDepth);

  // Size-dependent wind response:
  // Larger flakes have more surface area = more air resistance = drift more
  // Smaller flakes are denser relative to size = follow wind direction more directly
  // This creates realistic differential motion
  float sizeResponse = 0.7 + flakeSize * 0.6;  // Larger flakes drift more

  return (baseWind * (0.7 + gust * 0.3) + eddy) * heightFactor * windResponse * sizeResponse;
}

// ============================================================================
// SPARKLE EFFECT
// ============================================================================

float sparkle(vec2 cellId, float time, float seed) {
  // Sparkle is a brief, bright flash when flake catches light
  // Use high-frequency time-based noise with sharp threshold
  float sparklePhase = hash12(cellId + vec2(seed * 100.0, 0.0)) * 100.0;
  float sparkleFreq = 2.0 + hash12(cellId + vec2(0.0, seed * 100.0)) * 3.0;

  // Create sharp spike using pow
  float sparkleWave = sin(time * sparkleFreq + sparklePhase);
  float sparkleIntensity = pow(max(0.0, sparkleWave), 16.0);  // Sharp spike

  // Only some flakes sparkle at any given moment
  float sparkleProbability = hash12(cellId + vec2(floor(time * 0.5), 0.0));
  sparkleIntensity *= step(0.85, sparkleProbability);

  return sparkleIntensity * u_sparkle;
}

// ============================================================================
// SNOW LAYER
// ============================================================================

vec3 snowLayer(vec2 uv, float time, float layerIndex, float totalLayers) {
  // Layer depth: 0 = foreground, 1 = background
  float depth = layerIndex / max(1.0, totalLayers - 1.0);

  // Layer-specific properties
  float layerScale = mix(8.0, 40.0, depth);  // Closer = larger cells
  float layerSpeed = u_fallSpeed * mix(1.2, 0.4, depth);  // Closer = faster
  float layerDensity = u_intensity * mix(1.0, 0.5, depth);  // Closer = denser
  float layerFlakeSize = u_flakeSize * mix(1.5, 0.3, depth);  // Closer = bigger
  float layerOpacity = u_opacity * mix(1.0, 0.4, depth);  // Closer = more opaque

  // Unique offset per layer to prevent alignment
  vec2 layerOffset = vec2(
    sin(layerIndex * 73.156) * 10.0,
    cos(layerIndex * 37.842) * 10.0
  );

  // Apply motion - start with base position
  vec2 p = (uv + layerOffset) * layerScale;

  // Vertical fall
  p.y += time * layerSpeed * 2.0;

  // Wind shear creates curved paths: accumulate horizontal offset based on height
  // As flake falls from top, it accumulates more horizontal drift
  // This is calculated per-pixel to show the curve
  float fallProgress = fract(p.y / layerScale);  // Where in fall cycle
  float accumulatedShear = (1.0 - uv.y) * u_windShear * u_windSpeed * time * 0.3;
  p.x += accumulatedShear * cos(u_windAngle);

  // Get base wind (will be modified per-flake by size)
  vec2 baseWind = getWind(uv, time, depth, 1.0);

  // Base horizontal wind drift
  p.x += time * baseWind.x * 0.3;

  // Sinusoidal drift (gentle wandering)
  float driftPhase = layerIndex * 1.7;
  p.x += sin(time * 0.5 + p.y * 0.1 + driftPhase) * u_drift * 2.0;

  // Grid-based flake placement
  vec2 id = floor(p);
  vec2 gv = fract(p) - 0.5;

  float snow = 0.0;
  float sparkleAccum = 0.0;

  // Check neighboring cells for flakes
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      vec2 cellId = id + offs;

      // Random values for this cell
      float h1 = hash12(cellId);
      vec2 h2 = hash22(cellId);
      float h3 = hash12(cellId + vec2(127.0, 311.0));
      float h4 = hash12(cellId + vec2(271.0, 183.0));

      // Skip based on density
      if (h1 > layerDensity) continue;

      // Flake size with variation (calculate early for wind response)
      float sizeVar = 1.0 + (h3 - 0.5) * u_sizeVariation;
      float size = layerFlakeSize * sizeVar * 0.04;

      // Size-dependent wind offset
      // Larger flakes accumulate more horizontal drift
      float sizeWindFactor = 0.7 + sizeVar * 0.6;
      vec2 sizeWindOffset = baseWind * sizeWindFactor * time * 0.1;

      // Random position within cell
      vec2 flakePos = h2 * 0.8 - 0.4;

      // Apply size-dependent wind to position
      flakePos.x += sizeWindOffset.x * 0.5;

      // Flutter - individual flake wobble
      float flutterPhase = h3 * PI * 2.0;
      float flutterAmp = u_flutter * 0.15 * (1.0 - depth);
      flakePos.x += sin(time * 3.0 + flutterPhase) * flutterAmp;
      flakePos.y += cos(time * 2.5 + flutterPhase * 1.3) * flutterAmp * 0.5;

      // Local UV relative to flake center
      vec2 localUV = gv - offs - flakePos;

      // Rotation: tumbling animation
      // Rotation speed varies by flake, larger flakes rotate slower
      float rotationSpeed = (1.5 - sizeVar * 0.5) * (0.5 + h4 * 1.0);
      float rotationPhase = h4 * PI * 2.0;
      float rotation = time * rotationSpeed + rotationPhase;

      // Get snowflake shape with rotation
      float flake = snowflakeShape(localUV, size, h1, rotation);

      // Calculate sparkle for this flake
      float flakeSparkle = sparkle(cellId, time, h1) * flake;
      sparkleAccum += flakeSparkle;

      snow += flake * layerOpacity;
    }
  }

  // Return snow intensity and sparkle separately
  // x = snow, y = sparkle, z = depth (for color tinting)
  return vec3(snow, sparkleAccum, depth);
}

// ============================================================================
// BLIZZARD FOG
// ============================================================================

float blizzardFog(vec2 uv, float time) {
  // Only active when visibility is reduced
  float fogAmount = 1.0 - u_visibility;
  if (fogAmount < 0.01) return 0.0;

  // Animated noise-based fog
  float fog = fbm(uv * 3.0 + time * 0.1 * u_windSpeed, 3);
  fog = fog * 0.5 + 0.3;

  // Stronger at top (snow coming from sky)
  fog *= 0.5 + uv.y * 0.5;

  return fog * fogAmount * 0.6;
}

// ============================================================================
// MAIN
// ============================================================================

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float time = u_time;

  // Accumulate snow from all layers (back to front)
  float snow = 0.0;
  float totalSparkle = 0.0;

  for (int i = u_layers - 1; i >= 0; i--) {
    vec3 layerResult = snowLayer(uv, time, float(i), float(u_layers));
    snow += layerResult.x;
    totalSparkle += layerResult.y;
  }

  // Clamp accumulated snow
  snow = clamp(snow, 0.0, 1.0);
  totalSparkle = clamp(totalSparkle, 0.0, 1.0);

  // Add blizzard fog/whiteout effect
  float fog = blizzardFog(uv, time);

  // Final color - white snow on transparent background
  // The slight blue tint is for distant flakes (aerial perspective)
  vec3 snowColor = vec3(0.95, 0.97, 1.0);
  vec3 sparkleColor = vec3(1.0, 1.0, 1.0);  // Pure white sparkle
  vec3 fogColor = vec3(0.9, 0.92, 0.95);

  vec3 color = snowColor * snow + fogColor * fog;

  // Add sparkle as additive bright highlights
  color += sparkleColor * totalSparkle * 2.0;

  float alpha = snow + fog + totalSparkle;

  // Debug visualization
  if (u_debug) {
    // Show wind field
    vec2 wind = getWind(uv, time, 0.5, 1.0);
    color.r += abs(wind.x) * 0.5;
    color.g += abs(wind.y) * 0.5;

    // Show sparkle intensity
    color.b += totalSparkle;

    // Grid
    vec2 grid = fract(uv * 10.0);
    float gridLines = step(0.95, grid.x) + step(0.95, grid.y);
    color = mix(color, vec3(1.0, 0.0, 0.0), gridLines * 0.3);

    alpha = max(alpha, 0.3);
  }

  // Output with premultiplied alpha for proper compositing
  fragColor = vec4(color * alpha, alpha);
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

export function SnowCanvas({
  className,
  intensity = 0.5,
  layers = 4,
  fallSpeed = 0.6,
  windSpeed = 0.3,
  windAngle = 0.2,
  turbulence = 0.3,
  drift = 0.5,
  flutter = 0.5,
  windShear = 0.5,
  flakeSize = 1.0,
  sizeVariation = 0.5,
  opacity = 0.8,
  glowAmount = 0.5,
  sparkle = 0.5,
  visibility = 1.0,
  debug = false,
}: SnowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    intensity: WebGLUniformLocation | null;
    layers: WebGLUniformLocation | null;
    fallSpeed: WebGLUniformLocation | null;
    windSpeed: WebGLUniformLocation | null;
    windAngle: WebGLUniformLocation | null;
    turbulence: WebGLUniformLocation | null;
    drift: WebGLUniformLocation | null;
    flutter: WebGLUniformLocation | null;
    windShear: WebGLUniformLocation | null;
    flakeSize: WebGLUniformLocation | null;
    sizeVariation: WebGLUniformLocation | null;
    opacity: WebGLUniformLocation | null;
    glowAmount: WebGLUniformLocation | null;
    sparkle: WebGLUniformLocation | null;
    visibility: WebGLUniformLocation | null;
    debug: WebGLUniformLocation | null;
  } | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true });
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
      intensity: gl.getUniformLocation(program, "u_intensity"),
      layers: gl.getUniformLocation(program, "u_layers"),
      fallSpeed: gl.getUniformLocation(program, "u_fallSpeed"),
      windSpeed: gl.getUniformLocation(program, "u_windSpeed"),
      windAngle: gl.getUniformLocation(program, "u_windAngle"),
      turbulence: gl.getUniformLocation(program, "u_turbulence"),
      drift: gl.getUniformLocation(program, "u_drift"),
      flutter: gl.getUniformLocation(program, "u_flutter"),
      windShear: gl.getUniformLocation(program, "u_windShear"),
      flakeSize: gl.getUniformLocation(program, "u_flakeSize"),
      sizeVariation: gl.getUniformLocation(program, "u_sizeVariation"),
      opacity: gl.getUniformLocation(program, "u_opacity"),
      glowAmount: gl.getUniformLocation(program, "u_glowAmount"),
      sparkle: gl.getUniformLocation(program, "u_sparkle"),
      visibility: gl.getUniformLocation(program, "u_visibility"),
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

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

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

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform1f(uniforms.time, time);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.intensity, intensity);
    gl.uniform1i(uniforms.layers, layers);
    gl.uniform1f(uniforms.fallSpeed, fallSpeed);
    gl.uniform1f(uniforms.windSpeed, windSpeed);
    gl.uniform1f(uniforms.windAngle, windAngle);
    gl.uniform1f(uniforms.turbulence, turbulence);
    gl.uniform1f(uniforms.drift, drift);
    gl.uniform1f(uniforms.flutter, flutter);
    gl.uniform1f(uniforms.windShear, windShear);
    gl.uniform1f(uniforms.flakeSize, flakeSize);
    gl.uniform1f(uniforms.sizeVariation, sizeVariation);
    gl.uniform1f(uniforms.opacity, opacity);
    gl.uniform1f(uniforms.glowAmount, glowAmount);
    gl.uniform1f(uniforms.sparkle, sparkle);
    gl.uniform1f(uniforms.visibility, visibility);
    gl.uniform1i(uniforms.debug, debug ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [
    intensity, layers, fallSpeed, windSpeed, windAngle,
    turbulence, drift, flutter, windShear, flakeSize, sizeVariation,
    opacity, glowAmount, sparkle, visibility, debug
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
