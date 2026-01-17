"use client";

import { useEffect, useRef, useCallback } from "react";

interface RainCanvasProps {
  className?: string;
  intensity?: number;
  zoom?: number;
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
uniform float u_intensity;
uniform float u_zoom;
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

  // Bokeh lights
  for (int i = 0; i < 40; i++) {
    vec3 n = N13(float(i) * 13.7);
    vec2 lightPos = vec2(n.x, n.y * 0.5);

    float dist = length(uv - lightPos);
    float bokeh = exp(-dist * dist * 60.0);

    // Color variation
    vec3 lightColor = mix(vec3(1.0, 0.9, 0.7), N13(float(i) * 7.3), 0.4);

    // Brightness and twinkle
    float brightness = 0.3 + n.z * 0.7;
    float twinkle = 0.85 + 0.15 * sin(u_time * (1.0 + n.z * 2.0) + n.x * 6.28);

    color += lightColor * bokeh * brightness * twinkle * 0.35;
  }

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
// COMBINED DROPS
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
// MAIN
// ============================================================================

void main() {
  // Normalized coordinates centered at origin
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  vec2 UV = gl_FragCoord.xy / u_resolution.xy;

  // Apply zoom
  uv *= u_zoom;

  float t = u_time * 0.2;

  // Rain amount controls layer visibility
  float rainAmount = u_intensity;

  // Layer intensities based on rain amount
  float staticDrops = S(-0.5, 1.0, rainAmount) * 2.0;
  float layer1 = S(0.25, 0.75, rainAmount);
  float layer2 = S(0.0, 0.5, rainAmount);

  // Calculate drops
  vec2 c = Drops(uv, t, staticDrops, layer1, layer2);

  // Calculate normals by sampling at offsets (gradient-based)
  vec2 e = vec2(0.001, 0.0);
  float cx = Drops(uv + e, t, staticDrops, layer1, layer2).x;
  float cy = Drops(uv + e.yx, t, staticDrops, layer1, layer2).x;
  vec2 n = vec2(cx - c.x, cy - c.x);

  // Blur amount based on trail (further = more blur)
  float maxBlur = mix(3.0, 6.0, rainAmount);
  float minBlur = 2.0;
  float focus = mix(maxBlur - c.y, minBlur, S(0.1, 0.2, c.x));

  // Sample background with refraction
  vec2 refractedUV = UV + n;
  refractedUV = clamp(refractedUV, 0.0, 1.0);

  vec3 color = cityLights(refractedUV);

  // Add slight brightness to drops themselves
  color += vec3(0.1, 0.12, 0.15) * c.x * 0.5;

  // Debug mode
  if (u_debug) {
    // Show grid
    vec2 grid = fract(uv * 12.0);
    float gridLines = step(0.98, grid.x) + step(0.98, grid.y);
    color = mix(color, vec3(1.0, 0.0, 0.0), gridLines * 0.3);

    // Show normals
    color.rg += abs(n) * 50.0;

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
  intensity = 0.5,
  zoom = 1.0,
  debug = false,
}: RainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    intensity: WebGLUniformLocation | null;
    zoom: WebGLUniformLocation | null;
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
      intensity: gl.getUniformLocation(program, "u_intensity"),
      zoom: gl.getUniformLocation(program, "u_zoom"),
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
    gl.uniform1f(uniforms.intensity, intensity);
    gl.uniform1f(uniforms.zoom, zoom);
    gl.uniform1i(uniforms.debug, debug ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [intensity, zoom, debug]);

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
