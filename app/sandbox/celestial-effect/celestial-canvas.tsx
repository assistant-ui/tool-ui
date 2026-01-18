"use client";

import { useEffect, useRef, useCallback } from "react";

// =============================================================================
// TYPES
// =============================================================================

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

interface UniformLocations {
  u_time: WebGLUniformLocation | null;
  u_resolution: WebGLUniformLocation | null;
  u_timeOfDay: WebGLUniformLocation | null;
  u_sunSize: WebGLUniformLocation | null;
  u_sunGlowIntensity: WebGLUniformLocation | null;
  u_sunGlowSize: WebGLUniformLocation | null;
  u_sunRaysEnabled: WebGLUniformLocation | null;
  u_sunRayCount: WebGLUniformLocation | null;
  u_sunRayLength: WebGLUniformLocation | null;
  u_moonSize: WebGLUniformLocation | null;
  u_moonPhase: WebGLUniformLocation | null;
  u_moonGlowIntensity: WebGLUniformLocation | null;
  u_moonGlowSize: WebGLUniformLocation | null;
  u_showCraters: WebGLUniformLocation | null;
  u_craterDetail: WebGLUniformLocation | null;
  u_horizonOffset: WebGLUniformLocation | null;
  u_atmosphereThickness: WebGLUniformLocation | null;
  u_starDensity: WebGLUniformLocation | null;
  u_showPath: WebGLUniformLocation | null;
  u_debug: WebGLUniformLocation | null;
  u_moonTexture: WebGLUniformLocation | null;
  u_hasMoonTexture: WebGLUniformLocation | null;
}

// =============================================================================
// SHADER: VERTEX
// =============================================================================

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec4 a_position;
out vec2 v_uv;

void main() {
  gl_Position = a_position;
  v_uv = a_position.xy * 0.5 + 0.5;
}
`;

// =============================================================================
// SHADER: FRAGMENT - GLSL functions organized by category
// =============================================================================

const GLSL_CONSTANTS = /* glsl */ `
#define PI 3.14159265359
#define TAU 6.28318530718
`;

const GLSL_UNIFORMS = /* glsl */ `
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
`;

const GLSL_NOISE = /* glsl */ `
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
`;

const GLSL_CELESTIAL_POSITIONS = /* glsl */ `
vec2 getSunPosition(float timeOfDay, float horizonOffset) {
  float angle = (timeOfDay - 0.25) * 2.0 * PI;
  float x = 0.5 - cos(angle) * 0.4;
  float y = horizonOffset + sin(angle) * 0.45;
  return vec2(x, y);
}

vec2 getMoonPosition(float timeOfDay, float horizonOffset) {
  float moonTime = fract(timeOfDay + 0.5);
  float angle = (moonTime - 0.25) * 2.0 * PI;
  float x = 0.5 - cos(angle) * 0.4;
  float y = horizonOffset + sin(angle) * 0.45;
  return vec2(x, y);
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
`;

const GLSL_SKY = /* glsl */ `
vec3 getSkyColor(vec2 uv, float timeOfDay, float atmosphereThickness) {
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

  float gradientFactor = pow(1.0 - uv.y, atmosphereThickness);

  vec3 topColor = dayTop * dayAmount + sunsetTop * sunsetAmount + nightTop * nightAmount;
  vec3 horizonColor = dayHorizon * dayAmount + sunsetHorizon * sunsetAmount + nightHorizon * nightAmount;

  return mix(topColor, horizonColor, gradientFactor);
}
`;

const GLSL_STARS = /* glsl */ `
float drawStars(vec2 uv, float density, float time) {
  float stars = 0.0;

  for (int layer = 0; layer < 3; layer++) {
    float layerScale = 100.0 + float(layer) * 50.0;
    vec2 gridUV = uv * layerScale;
    vec2 gridID = floor(gridUV);
    vec2 gridFract = fract(gridUV);

    vec2 starOffset = hash2(gridID + float(layer) * 100.0);
    vec2 starPos = starOffset;

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
`;

const GLSL_SUN = /* glsl */ `
vec3 drawSun(vec2 uv, vec2 sunPos, float size, float glowIntensity, float glowSize,
             bool showRays, int rayCount, float rayLength, float time) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 diff = (uv - sunPos) * aspect;
  float dist = length(diff);

  float disc = 1.0 - smoothstep(size * 0.9, size, dist);

  vec3 sunCore = vec3(1.0, 1.0, 0.95);
  vec3 sunEdge = vec3(1.0, 0.9, 0.4);
  float edgeFactor = clamp(dist / size, 0.0, 1.0);
  vec3 sunColor = mix(sunCore, sunEdge, edgeFactor);

  float limbDarkening = 1.0 - pow(clamp(dist / size, 0.0, 1.0), 2.0) * 0.3;
  sunColor *= limbDarkening;

  float scaledDist = dist / (glowSize * 0.1);
  float glow1 = exp(-scaledDist * 8.0) * glowIntensity * 0.5;
  float glow2 = exp(-scaledDist * 3.0) * glowIntensity * 0.3;
  float glow3 = exp(-scaledDist * 1.5) * glowIntensity * 0.15;

  vec3 glowColor = vec3(1.0, 0.8, 0.4);

  float rays = 0.0;
  if (showRays && dist > size * 0.5) {
    float angle = atan(diff.y, diff.x);
    float rayPattern = sin(angle * float(rayCount) + time * 0.5) * 0.5 + 0.5;
    rayPattern = pow(rayPattern, 3.0);

    float rayFalloff = exp(-dist / (rayLength * 0.5));
    rays = rayPattern * rayFalloff * 0.4 * glowIntensity;
  }

  vec3 result = sunColor * disc * 2.0;
  result += glowColor * (glow1 + glow2 + glow3);
  result += vec3(1.0, 0.9, 0.6) * rays;

  return result;
}
`;

const GLSL_MOON = /* glsl */ `
vec3 getSphereNormal(vec2 discUV) {
  float r2 = dot(discUV, discUV);
  if (r2 > 1.0) return vec3(0.0);
  float z = sqrt(1.0 - r2);
  return normalize(vec3(discUV.x, discUV.y, z));
}

vec2 sphereToEquirectangular(vec3 normal) {
  float longitude = atan(normal.x, normal.z);
  float u = longitude / TAU + 0.5;

  float latitude = asin(clamp(normal.y, -1.0, 1.0));
  float v = latitude / PI + 0.5;

  return vec2(u, v);
}

vec3 getMoonSurfaceColor(vec3 normal, vec2 discUV) {
  if (u_hasMoonTexture) {
    vec2 texUV = sphereToEquirectangular(normal);
    vec3 texColor = texture(u_moonTexture, texUV).rgb;
    return texColor;
  }

  float brightness = 0.7 + fbm(discUV * 5.0, 3) * 0.3;
  return vec3(brightness * 0.85, brightness * 0.83, brightness * 0.8);
}

vec4 drawMoon(vec2 uv, vec2 moonPos, float size, float phase, float glowIntensity,
              float glowSize, bool showCraters, float craterDetail, float time) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 diff = (uv - moonPos) * aspect;
  float dist = length(diff);

  vec2 discUV = diff / size;
  float discDist = length(discUV);

  float disc = 1.0 - smoothstep(0.95, 1.0, discDist);

  if (disc < 0.001) {
    float scaledDist = dist / (glowSize * 0.08);
    float glow1 = exp(-scaledDist * 6.0) * glowIntensity * 0.25;
    float glow2 = exp(-scaledDist * 2.0) * glowIntensity * 0.1;
    vec3 glowColor = vec3(0.8, 0.85, 0.95);

    float phaseAngle = phase * TAU;
    vec3 sunDir = vec3(sin(phaseAngle), 0.0, -cos(phaseAngle));
    float glowPhase = max(0.2, dot(normalize(vec3(discUV, 0.5)), sunDir) * 0.5 + 0.5);

    return vec4(glowColor * (glow1 + glow2) * glowPhase, 0.0);
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

  float scaledDist = dist / (glowSize * 0.08);
  float glow1 = exp(-scaledDist * 6.0) * glowIntensity * 0.2;
  float glow2 = exp(-scaledDist * 2.0) * glowIntensity * 0.1;
  vec3 glowColor = vec3(0.8, 0.85, 0.95);

  float litAmount = max(0.1, terminator);

  vec3 result = moonSurface;
  vec3 glow = glowColor * (glow1 + glow2) * litAmount;

  return vec4(result * disc + glow, disc);
}
`;

const GLSL_DEBUG = /* glsl */ `
vec3 drawOrbitalPath(vec2 uv, float horizonOffset) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);

  vec2 arcCenter = vec2(0.5, horizonOffset);
  vec2 diff = (uv - arcCenter) * aspect;

  float ellipseX = diff.x / 0.4;
  float ellipseY = diff.y / 0.45;
  float ellipseDist = abs(length(vec2(ellipseX, ellipseY)) - 1.0);

  float upperHalf = step(0.0, diff.y);
  float path = smoothstep(0.02, 0.01, ellipseDist) * upperHalf;

  float horizon = smoothstep(0.005, 0.002, abs(uv.y - horizonOffset));

  return vec3(0.3, 0.3, 0.5) * path + vec3(0.5, 0.3, 0.3) * horizon;
}
`;

const GLSL_MAIN = /* glsl */ `
void main() {
  vec2 uv = v_uv;

  vec3 color = getSkyColor(uv, u_timeOfDay, u_atmosphereThickness);

  float nightFactor = getMoonVisibility(u_timeOfDay);
  if (nightFactor > 0.01) {
    float stars = drawStars(uv, u_starDensity, u_time);
    color += vec3(stars) * nightFactor;
  }

  if (u_showPath) {
    color += drawOrbitalPath(uv, u_horizonOffset);
  }

  float sunVis = getSunVisibility(u_timeOfDay);
  if (sunVis > 0.01) {
    vec2 sunPos = getSunPosition(u_timeOfDay, u_horizonOffset);
    vec3 sun = drawSun(uv, sunPos, u_sunSize, u_sunGlowIntensity, u_sunGlowSize,
                       u_sunRaysEnabled, u_sunRayCount, u_sunRayLength, u_time);
    color += sun * sunVis;
  }

  float moonVis = getMoonVisibility(u_timeOfDay);
  if (moonVis > 0.01) {
    vec2 moonPos = getMoonPosition(u_timeOfDay, u_horizonOffset);
    vec4 moon = drawMoon(uv, moonPos, u_moonSize, u_moonPhase, u_moonGlowIntensity,
                         u_moonGlowSize, u_showCraters, u_craterDetail, u_time);
    float alpha = moon.a * moonVis;
    color = mix(color, moon.rgb, alpha) + moon.rgb * (1.0 - moon.a) * moonVis;
  }

  if (u_debug) {
    if (uv.x < 0.1 && uv.y > 0.95) {
      color = vec3(u_timeOfDay, 0.0, 0.0);
    }
  }

  fragColor = vec4(color, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

${GLSL_CONSTANTS}
${GLSL_UNIFORMS}
${GLSL_NOISE}
${GLSL_CELESTIAL_POSITIONS}
${GLSL_SKY}
${GLSL_STARS}
${GLSL_SUN}
${GLSL_MOON}
${GLSL_DEBUG}
${GLSL_MAIN}
`;

// =============================================================================
// WEBGL UTILITIES
// =============================================================================

function createShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
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

function getUniformLocations(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
): UniformLocations {
  const uniformNames: Array<keyof UniformLocations> = [
    "u_time",
    "u_resolution",
    "u_timeOfDay",
    "u_sunSize",
    "u_sunGlowIntensity",
    "u_sunGlowSize",
    "u_sunRaysEnabled",
    "u_sunRayCount",
    "u_sunRayLength",
    "u_moonSize",
    "u_moonPhase",
    "u_moonGlowIntensity",
    "u_moonGlowSize",
    "u_showCraters",
    "u_craterDetail",
    "u_horizonOffset",
    "u_atmosphereThickness",
    "u_starDensity",
    "u_showPath",
    "u_debug",
    "u_moonTexture",
    "u_hasMoonTexture",
  ];

  const locations = {} as UniformLocations;
  for (const name of uniformNames) {
    locations[name] = gl.getUniformLocation(program, name);
  }
  return locations;
}

function setupQuadGeometry(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
): void {
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
}

function loadMoonTexture(
  gl: WebGL2RenderingContext,
  onLoad: () => void
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([128, 128, 128, 255])
  );

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    onLoad();
  };
  image.src = "/assets/moon-texture.jpg";

  return texture;
}

function updateCanvasSize(
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext
): void {
  const displayWidth = canvas.clientWidth * window.devicePixelRatio;
  const displayHeight = canvas.clientHeight * window.devicePixelRatio;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

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
  const uniformsRef = useRef<UniformLocations | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const animatedTimeRef = useRef<number>(timeOfDay);
  const moonTextureRef = useRef<WebGLTexture | null>(null);
  const moonTextureLoadedRef = useRef<boolean>(false);

  const propsRef = useRef({
    timeOfDay,
    animateTime,
    dayDuration,
    sunSize,
    sunGlowIntensity,
    sunGlowSize,
    sunRaysEnabled,
    sunRayCount,
    sunRayLength,
    moonSize,
    moonPhase,
    moonGlowIntensity,
    moonGlowSize,
    showCraters,
    craterDetail,
    horizonOffset,
    atmosphereThickness,
    starDensity,
    showPath,
    debug,
  });

  propsRef.current = {
    timeOfDay,
    animateTime,
    dayDuration,
    sunSize,
    sunGlowIntensity,
    sunGlowSize,
    sunRaysEnabled,
    sunRayCount,
    sunRayLength,
    moonSize,
    moonPhase,
    moonGlowIntensity,
    moonGlowSize,
    showCraters,
    craterDetail,
    horizonOffset,
    atmosphereThickness,
    starDensity,
    showPath,
    debug,
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

    uniformsRef.current = getUniformLocations(gl, program);

    moonTextureRef.current = loadMoonTexture(gl, () => {
      moonTextureLoadedRef.current = true;
    });

    setupQuadGeometry(gl, program);

    startTimeRef.current = performance.now();
    return true;
  }, []);

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const uniforms = uniformsRef.current;
    const canvas = canvasRef.current;
    const props = propsRef.current;

    if (!gl || !program || !uniforms || !canvas) return;

    updateCanvasSize(canvas, gl);

    const time = (performance.now() - startTimeRef.current) / 1000;

    if (props.animateTime) {
      animatedTimeRef.current = (time / props.dayDuration) % 1.0;
    } else {
      animatedTimeRef.current = props.timeOfDay;
    }

    gl.useProgram(program);

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

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, moonTextureRef.current);
    gl.uniform1i(uniforms.u_moonTexture, 0);
    gl.uniform1i(uniforms.u_hasMoonTexture, moonTextureLoadedRef.current ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

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
