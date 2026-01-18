"use client";

import { useEffect, useRef, useCallback } from "react";

interface LightningCanvasProps {
  className?: string;
  branchDensity?: number;
  displacement?: number;
  glowIntensity?: number;
  flashDuration?: number;
  sceneIllumination?: number;
  afterglowPersistence?: number;
  triggerCount?: number;
  autoMode?: boolean;
  autoInterval?: number;
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
uniform float u_branchDensity;
uniform float u_displacement;
uniform float u_glowIntensity;
uniform float u_flashDuration;
uniform float u_sceneIllumination;
uniform float u_afterglowPersistence;
uniform float u_strikeTime;
uniform float u_strikeSeed;
uniform bool u_debug;

#define MAX_SEGMENTS 32
#define MAX_BRANCHES 16
#define PI 3.14159265359

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

float easeOutSine(float t) {
  return sin(t * PI * 0.5);
}

float easeInSine(float t) {
  return 1.0 - cos(t * PI * 0.5);
}

float easeInOutSine(float t) {
  return -(cos(PI * t) - 1.0) * 0.5;
}

float easeOutQuad(float t) {
  return 1.0 - (1.0 - t) * (1.0 - t);
}

float easeOutCubic(float t) {
  float inv = 1.0 - t;
  return 1.0 - inv * inv * inv;
}

float easeInOutCubic(float t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;
}

// ============================================================================
// NOISE FUNCTIONS
// ============================================================================

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

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// ============================================================================
// BACKGROUND - Stormy night sky
// ============================================================================

vec3 stormySky(vec2 uv, float illumination) {
  // Base dark sky
  vec3 skyDark = vec3(0.02, 0.02, 0.04);
  vec3 skyLight = vec3(0.15, 0.15, 0.2);

  // Cloud layer using FBM
  float clouds = fbm(uv * 3.0 + u_time * 0.01, 4);
  clouds = smoothstep(0.3, 0.7, clouds);

  vec3 color = mix(skyDark, skyLight, clouds * 0.3);

  // When lightning strikes, illuminate clouds
  color = mix(color, vec3(0.6, 0.65, 0.75), illumination * clouds);
  color = mix(color, vec3(0.3, 0.32, 0.4), illumination * (1.0 - clouds) * 0.5);

  return color;
}

// ============================================================================
// LIGHTNING PATH GENERATION
// ============================================================================

// Distance from point to line segment
float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Generate displaced point along path using midpoint displacement principle
vec2 displacedPoint(vec2 start, vec2 end, float t, float seed, float displacementAmt) {
  vec2 basePoint = mix(start, end, t);

  // Direction perpendicular to path
  vec2 dir = end - start;
  vec2 perp = normalize(vec2(-dir.y, dir.x));

  // Displacement amount varies: max at middle, zero at ends
  float envelope = sin(t * PI);

  // Multi-frequency noise for organic look
  float n1 = noise(vec2(t * 8.0, seed * 100.0)) * 2.0 - 1.0;
  float n2 = noise(vec2(t * 16.0, seed * 100.0 + 50.0)) * 2.0 - 1.0;
  float n3 = noise(vec2(t * 32.0, seed * 100.0 + 100.0)) * 2.0 - 1.0;

  float displacement = (n1 * 0.6 + n2 * 0.3 + n3 * 0.1) * envelope * displacementAmt;

  // Bias toward target (DBM-inspired) - reduces displacement as we get closer to end
  float targetBias = 1.0 - t * 0.3;
  displacement *= targetBias;

  return basePoint + perp * displacement * length(dir);
}

// Calculate distance to the main lightning bolt
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

// Calculate distance to a branch
float branchDistance(vec2 uv, vec2 branchStart, vec2 branchDir, float branchLen, float seed, float displacementAmt) {
  vec2 branchEnd = branchStart + branchDir * branchLen;

  float minDist = 999.0;
  int segments = 12;

  vec2 prevPoint = branchStart;
  for (int i = 1; i <= 12; i++) {
    float t = float(i) / float(segments);
    vec2 currPoint = displacedPoint(branchStart, branchEnd, t, seed, displacementAmt * 0.7);

    float d = distToSegment(uv, prevPoint, currPoint);
    minDist = min(minDist, d);

    prevPoint = currPoint;
  }

  return minDist;
}

// Generate all branches and return minimum distance with brightness
vec2 branchesDistance(vec2 uv, vec2 start, vec2 end, float seed, float displacementAmt, float density) {
  float minDist = 999.0;
  float brightness = 0.0;

  vec2 mainDir = normalize(end - start);
  float mainLen = length(end - start);

  // Generate branches along the main bolt
  for (int i = 0; i < MAX_BRANCHES; i++) {
    float idx = float(i);

    // Position along main bolt where branch starts (avoid very start/end)
    float branchT = 0.15 + hash11(seed + idx * 7.31) * 0.7;

    // Branch probability decreases toward end (more branches near cloud)
    float branchProb = (1.0 - branchT) * density;
    if (hash11(seed + idx * 3.17) > branchProb) continue;

    // Get branch start point on main bolt
    vec2 branchStart = displacedPoint(start, end, branchT, seed, displacementAmt);

    // Branch angle: 15-45 degrees from main direction
    float angleOffset = (hash11(seed + idx * 11.13) * 2.0 - 1.0) * 0.6;
    float side = hash11(seed + idx * 5.71) > 0.5 ? 1.0 : -1.0;
    float angle = atan(mainDir.y, mainDir.x) + side * (0.3 + abs(angleOffset) * 0.5);
    vec2 branchDir = vec2(cos(angle), sin(angle));

    // Branch length: 15-40% of main bolt
    float branchLen = mainLen * (0.15 + hash11(seed + idx * 13.37) * 0.25);

    // Calculate distance to this branch
    float d = branchDistance(uv, branchStart, branchDir, branchLen, seed + idx * 100.0, displacementAmt);

    if (d < minDist) {
      minDist = d;
      // Brightness decreases with branch depth and distance from main
      brightness = 0.5 - branchT * 0.2;
    }

    // Sub-branches (level 2)
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

// ============================================================================
// GLOW RENDERING
// ============================================================================

vec3 lightningGlow(float dist, float brightness, float intensity, float thickness) {
  // Scale distance by inverse thickness - thinner bolt = larger effective distance
  float scaledDist = dist / max(thickness, 0.1);

  // Core: brilliant white, very sharp
  float core = smoothstep(0.003, 0.0, scaledDist) * brightness;

  // Inner glow: blue-white, exponential falloff
  float innerGlow = exp(-scaledDist * 150.0) * brightness;

  // Outer glow: purple-blue, softer falloff (fades slower, provides lingering aura)
  float outerGlow = exp(-dist * dist * 3000.0) * brightness * thickness;

  // Combine with colors
  vec3 coreColor = vec3(1.0, 1.0, 1.0);
  vec3 innerColor = vec3(0.7, 0.8, 1.0);
  vec3 outerColor = vec3(0.5, 0.5, 0.9);

  vec3 color = coreColor * core * 2.0;
  color += innerColor * innerGlow * 0.8;
  color += outerColor * outerGlow * 0.5;

  return color * intensity;
}

// ============================================================================
// TEMPORAL ANIMATION
// ============================================================================

float flashEnvelope(float timeSinceStrike, float duration) {
  if (timeSinceStrike < 0.0 || timeSinceStrike > duration) return 0.0;

  float t = timeSinceStrike / duration;

  // Fast attack with sine easing (more natural ramp-up)
  float attackT = clamp(t / 0.03, 0.0, 1.0);
  float attack = easeOutCubic(attackT);

  // Sustain with sine easing for smoother rolloff
  float sustainT = clamp((t - 0.05) / 0.65, 0.0, 1.0);
  float sustain = 1.0 - easeInOutSine(sustainT);

  // Exponential decay with sine modulation for organic feel
  float decay = exp(-t * 2.0);
  decay = mix(decay, easeOutSine(1.0 - t), 0.3);

  // Smooth fade to zero with sine easing (prevents hard cutoff)
  float endT = clamp((t - 0.75) / 0.25, 0.0, 1.0);
  float endFade = 1.0 - easeInSine(endT);

  // Combine: sustain holds brightness longer, decay provides gentle tail
  return attack * max(sustain, decay * 0.4) * endFade;
}

// Re-strike effect (multiple flashes)
float restrikeEnvelope(float timeSinceStrike, float duration, float seed) {
  // Main flash uses 70% of duration for gradual falloff
  float env = flashEnvelope(timeSinceStrike, duration * 0.7);

  // Possible re-strikes (less frequent, later in timeline)
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

// ============================================================================
// MAIN
// ============================================================================

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  // Time since last strike
  float timeSinceStrike = u_time - u_strikeTime;
  float durationSec = u_flashDuration / 1000.0;

  // Flash envelope with re-strikes
  float flash = restrikeEnvelope(timeSinceStrike, durationSec, u_strikeSeed);

  // Afterimage has its own extended duration based on persistence
  float afterimageDuration = durationSec * (1.0 + u_afterglowPersistence * 0.5);
  float afterimageT = clamp(timeSinceStrike / afterimageDuration, 0.0, 1.0);
  float afterimage = timeSinceStrike < 0.0 ? 0.0 : (1.0 - easeInSine(afterimageT));

  // Scene illumination
  float sceneFlash = flash * u_sceneIllumination;

  // Background - also affected by afterimage for lingering illumination
  float bgIllumination = max(sceneFlash, afterimage * u_sceneIllumination * 0.15);
  vec3 color = stormySky(v_uv, bgIllumination);

  // Render lightning (bright core needs flash, afterglow uses afterimage)
  if (flash > 0.01 || afterimage > 0.01) {
    // Lightning start and end points (randomized per strike)
    vec2 strikeHash = hash22(vec2(u_strikeSeed * 123.456, u_strikeSeed * 789.012));

    // Start: somewhere in upper portion of screen
    vec2 boltStart = vec2(
      0.2 + strikeHash.x * 0.6,
      0.85 + strikeHash.y * 0.1
    );
    boltStart.x *= aspect;

    // End: toward bottom, somewhat below start
    vec2 boltEnd = vec2(
      boltStart.x + (strikeHash.x - 0.5) * 0.3,
      0.1 + strikeHash.y * 0.2
    );

    // Main bolt distance
    float mainDist = mainBoltDistance(uv, boltStart, boltEnd, u_strikeSeed, u_displacement);

    // Branch distances
    vec2 branchResult = branchesDistance(uv, boltStart, boltEnd, u_strikeSeed, u_displacement, u_branchDensity);
    float branchDist = branchResult.x;
    float branchBrightness = branchResult.y;

    // Thickness decay - bolt gets thinner as flash fades (sine easing for organic taper)
    float mainThickness = mix(0.2, 1.0, easeOutSine(sqrt(max(flash, 0.0))));

    // Afterglow color - slightly purple (retinal persistence)
    vec3 afterglowColor = vec3(0.5, 0.45, 0.7);

    // Main bolt: bright core with thickness decay + lingering afterglow
    vec3 mainCore = lightningGlow(mainDist, easeOutQuad(max(flash, 0.0)), u_glowIntensity, mainThickness);
    float mainAfterglowDist = mainDist * 0.6;  // Wider glow for afterimage
    float mainAfterglowStrength = exp(-mainAfterglowDist * 50.0) * afterimage * 0.5;
    vec3 mainAfterglow = afterglowColor * mainAfterglowStrength;
    vec3 mainGlow = mainCore + mainAfterglow;

    // Branches: bright core fades with flash, soft afterglow lingers
    float branchThickness = mix(0.15, 1.0, easeOutSine(max(flash, 0.0)));
    vec3 branchCore = lightningGlow(branchDist, branchBrightness * easeOutQuad(max(flash, 0.0)), u_glowIntensity, branchThickness);
    float branchAfterglowDist = branchDist * 0.7;  // Wider glow
    float branchAfterglowStrength = exp(-branchAfterglowDist * 80.0) * branchBrightness * afterimage * 0.4;
    vec3 branchAfterglow = afterglowColor * branchAfterglowStrength;

    // Bright cores - only visible during flash
    vec3 brightCores = mainCore + branchCore;
    color += brightCores * max(flash, 0.0);

    // Afterglow - persists based on afterimage (independent of flash)
    vec3 allAfterglow = mainAfterglow + branchAfterglow;
    color += allAfterglow * afterimage;

    // Add ambient glow from lightning source
    float sourceGlow = exp(-length(uv - boltStart) * 3.0);
    color += vec3(0.4, 0.45, 0.6) * sourceGlow * afterimage * 0.3;
  }

  // Debug visualization
  if (u_debug) {
    // Show strike timing
    float debugFlash = mod(u_time, 1.0) < 0.5 ? 1.0 : 0.0;
    color.r += flash * 0.3;

    // Grid
    vec2 grid = fract(uv * 10.0);
    float gridLines = step(0.95, grid.x) + step(0.95, grid.y);
    color = mix(color, vec3(0.3, 0.0, 0.0), gridLines * 0.3);
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

export function LightningCanvas({
  className,
  branchDensity = 0.5,
  displacement = 0.15,
  glowIntensity = 1.0,
  flashDuration = 150,
  sceneIllumination = 0.8,
  afterglowPersistence = 4.0,
  triggerCount = 0,
  autoMode = true,
  autoInterval = 8,
  debug = false,
}: LightningCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    branchDensity: WebGLUniformLocation | null;
    displacement: WebGLUniformLocation | null;
    glowIntensity: WebGLUniformLocation | null;
    flashDuration: WebGLUniformLocation | null;
    sceneIllumination: WebGLUniformLocation | null;
    afterglowPersistence: WebGLUniformLocation | null;
    strikeTime: WebGLUniformLocation | null;
    strikeSeed: WebGLUniformLocation | null;
    debug: WebGLUniformLocation | null;
  } | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const strikeTimeRef = useRef<number>(-10);
  const strikeSeedRef = useRef<number>(Math.random());
  const lastAutoStrikeRef = useRef<number>(0);
  const prevTriggerCountRef = useRef<number>(0);

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

    uniformsRef.current = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      branchDensity: gl.getUniformLocation(program, "u_branchDensity"),
      displacement: gl.getUniformLocation(program, "u_displacement"),
      glowIntensity: gl.getUniformLocation(program, "u_glowIntensity"),
      flashDuration: gl.getUniformLocation(program, "u_flashDuration"),
      sceneIllumination: gl.getUniformLocation(program, "u_sceneIllumination"),
      afterglowPersistence: gl.getUniformLocation(program, "u_afterglowPersistence"),
      strikeTime: gl.getUniformLocation(program, "u_strikeTime"),
      strikeSeed: gl.getUniformLocation(program, "u_strikeSeed"),
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

  // Trigger strike function
  const triggerStrike = useCallback(() => {
    const time = (performance.now() - startTimeRef.current) / 1000;
    strikeTimeRef.current = time;
    strikeSeedRef.current = Math.random();
  }, []);

  // Handle manual triggers
  useEffect(() => {
    if (triggerCount > prevTriggerCountRef.current) {
      triggerStrike();
    }
    prevTriggerCountRef.current = triggerCount;
  }, [triggerCount, triggerStrike]);

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

    // Auto-trigger logic
    if (autoMode) {
      const timeSinceLastStrike = time - lastAutoStrikeRef.current;
      if (timeSinceLastStrike > autoInterval) {
        strikeTimeRef.current = time;
        strikeSeedRef.current = Math.random();
        lastAutoStrikeRef.current = time;
      }
    }

    gl.useProgram(program);
    gl.uniform1f(uniforms.time, time);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.branchDensity, branchDensity);
    gl.uniform1f(uniforms.displacement, displacement);
    gl.uniform1f(uniforms.glowIntensity, glowIntensity);
    gl.uniform1f(uniforms.flashDuration, flashDuration);
    gl.uniform1f(uniforms.sceneIllumination, sceneIllumination);
    gl.uniform1f(uniforms.afterglowPersistence, afterglowPersistence);
    gl.uniform1f(uniforms.strikeTime, strikeTimeRef.current);
    gl.uniform1f(uniforms.strikeSeed, strikeSeedRef.current);
    gl.uniform1i(uniforms.debug, debug ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [branchDensity, displacement, glowIntensity, flashDuration, sceneIllumination, afterglowPersistence, autoMode, autoInterval, debug]);

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
