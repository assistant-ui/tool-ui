"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/ui/cn";
import * as THREE from "three";

type ZenFieldProps = {
  className?: string;
};

type PaletteConfig = {
  key: string;
  colors: [string, string, string];
  glow: string;
  alpha: number;
  milkyCool: string;
  milkyWarm: string;
  milkyWeight: number;
  depthTint: string;
  highlightTint: string;
};

function stableSeed(input: string): number {
  // Simple FNV-1a style hash to derive a deterministic seed per theme
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Map to a small positive float range so it acts as an initial time offset
  return ((h >>> 0) / 0xffffffff) * 1000;
}

const LIGHT_PALETTE: PaletteConfig = {
  key: "light",
  // Soft sunrise sky: warm whites and gentle cloud greys
  colors: ["#fff9f2", "#f2f7ff", "#fff4ea"],
  glow: "#ffd9b8",
  alpha: 0.95,
  milkyCool: "#fbfdff",
  milkyWarm: "#fff6ea",
  milkyWeight: 0.5,
  depthTint: "#aeb5bf",
  highlightTint: "#fff7ef",
};

const DARK_PALETTE: PaletteConfig = {
  key: "dark",
  colors: ["#000000", "#0a0a0b", "#1a1b1e"], // deep blacks to charcoal
  glow: "#8a8f98",
  alpha: 0.7,
  milkyCool: "#36393d",
  milkyWarm: "#46484c",
  milkyWeight: 0.12,
  depthTint: "#000000",
  highlightTint: "#d6d7da",
};

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorGlow;
  uniform float uAlpha;
  uniform vec3 uMilkyCool;
  uniform vec3 uMilkyWarm;
  uniform float uMilkyWeight;
  uniform vec3 uDepthTint;
  uniform vec3 uHighlightTint;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    mat2 rotate = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      total += amplitude * noise(p);
      p = rotate * p * 2.0;
      amplitude *= 0.5;
    }
    return total;
  }

  vec2 warp(vec2 p, float t, float scale) {
    float x = fbm(p * scale + vec2(t * 0.2, -t * 0.17));
    float y = fbm(p * (scale * 0.9) - vec2(t * 0.15, t * 0.19));
    return vec2(x, y);
  }

  void main() {
    vec2 centered = (vUv * 2.0) - 1.0;
    float len = length(centered);

    float t = uTime * 0.16;
    vec2 baseUv = centered * 1.35;
    vec2 domain = baseUv;
    domain += warp(baseUv, t, 0.6) * 0.9;
    domain += warp(baseUv + domain * 0.5, -t, 1.2) * 0.55;
    vec2 swirl = vec2(
      sin((baseUv.y + t) * 1.4),
      cos((baseUv.x - t) * 1.1)
    ) * 0.25;
    domain += swirl;

    float large = fbm(domain * 0.7 - vec2(t * 0.1, -t * 0.08));
    float medium = fbm(domain * 1.6 + vec2(t * 0.07, t * 0.05));
    float fine = fbm(domain * 2.8 - vec2(t * 0.02, t * 0.03));
    float micro = fbm(domain * 4.8 + vec2(t * 0.015, -t * 0.018));
    float field = large * 0.42 + medium * 0.28 + fine * 0.19 + micro * 0.11;

    float slowPulse = sin(t * 0.8 + large * 1.9) * 0.15;
    field = clamp(field + slowPulse, 0.0, 1.0);

    float hueShift = sin(field * 2.2 + t * 0.3) * 0.5 + 0.5; // only used for subtle milky mix
    float baseMix = smoothstep(0.08, 0.95, field);
    float tone = clamp(baseMix, 0.0, 1.0);
    vec3 color = mix(uDepthTint, vec3(1.0), tone);

    vec3 milky = mix(uMilkyCool, uMilkyWarm, hueShift);
    float milkyBlend = uMilkyWeight * (0.6 + 0.4 * baseMix);
    color = mix(color, milky, milkyBlend);

    vec3 depthTint = uDepthTint;
    float shadow = smoothstep(0.12, 0.75, 1.0 - field);
    color = mix(depthTint, color, 0.5 + 0.4 * field);

    float energy = smoothstep(0.3, 0.9, field);
    color = mix(color, uHighlightTint, energy * 0.5);

    float ridge = smoothstep(0.32, 0.92, field);
    vec2 grad = vec2(dFdx(field), dFdy(field));
    float curvature = smoothstep(0.0, 0.25, length(grad));
    float halo = smoothstep(0.1, 0.78, field) * smoothstep(0.0, 0.85, 0.9 - len);
    color += uColorGlow * (0.38 + 0.58 * ridge + 0.36 * curvature + 0.24 * halo);

    float detail = smoothstep(0.06, 0.28, length(grad));
    color = mix(color, vec3(1.12), detail * 0.45);

    float contrastGain = mix(1.15, 1.75, ridge + detail * 0.45 + shadow * 0.35);
    color = clamp((color - 0.42) * contrastGain + 0.42, 0.0, 1.45);

    float vignette = smoothstep(1.35, 0.32, len);
    float alpha = uAlpha * vignette * (0.78 + ridge * 0.3 + halo * 0.2);

    gl_FragColor = vec4(color, alpha);
  }
`;

export function ZenField({ className }: ZenFieldProps) {
  const { resolvedTheme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const palette = resolvedTheme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
  const blendClass = mounted && resolvedTheme !== "dark" ? "mix-blend-multiply" : "";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        "will-change-transform",
        blendClass,
        className,
      )}
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.6]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 1], fov: 30 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <ZenFieldLayer
            key={palette.key}
            palette={palette}
            animate={!prefersReducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function ZenFieldLayer({
  palette,
  animate,
}: {
  palette: PaletteConfig;
  animate: boolean;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const viewport = useThree((state) => state.viewport);
  const seed = useMemo(() => stableSeed(palette.key), [palette.key]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: seed },
      uColorA: { value: new THREE.Color(palette.colors[0]) },
      uColorB: { value: new THREE.Color(palette.colors[1]) },
      uColorC: { value: new THREE.Color(palette.colors[2]) },
      uColorGlow: { value: new THREE.Color(palette.glow) },
      uAlpha: { value: palette.alpha },
      uMilkyCool: { value: new THREE.Color(palette.milkyCool) },
      uMilkyWarm: { value: new THREE.Color(palette.milkyWarm) },
      uMilkyWeight: { value: palette.milkyWeight },
      uDepthTint: { value: new THREE.Color(palette.depthTint) },
      uHighlightTint: { value: new THREE.Color(palette.highlightTint) },
    }),
    [palette, seed],
  );

  useFrame((_, delta) => {
    if (!materialRef.current || !animate) {
      return;
    }
    materialRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}
