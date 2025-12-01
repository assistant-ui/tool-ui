"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Mesh, Shape, Path, ExtrudeGeometry } from "three";
import { useTheme } from "next-themes";

// CSS for smooth color transitions with soft glow
const asciiTransitionStyles = `
  .ascii-scene table {
    text-shadow: 0 0 10px currentColor;
  }
  .ascii-scene table td {

  }
`;

function createHexnutGeometry(
  outerRadius = 1,
  innerRadius = 0.5,
  height = 0.4,
) {
  const shape = new Shape();

  // Create hexagon outer shape
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * outerRadius;
    const y = Math.sin(angle) * outerRadius;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();

  // Create circular hole
  const hole = new Path();
  const segments = 32;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * innerRadius;
    const y = Math.sin(angle) * innerRadius;
    if (i === 0) {
      hole.moveTo(x, y);
    } else {
      hole.lineTo(x, y);
    }
  }
  hole.closePath();
  shape.holes.push(hole);

  const geometry = new ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });

  // Center the geometry so it rotates around its true center
  geometry.center();

  return geometry;
}

interface HexnutProps {
  color?: string;
  scale?: number;
  initialRotation?: [number, number, number];
  rotationSpeed?: number;
}

function RotatingHexnut({
  color = "#ffffff",
  scale = 2.1,
  initialRotation = [0.75, -0.75, 0],
  rotationSpeed = 0.1,
}: HexnutProps) {
  const meshRef = useRef<Mesh>(null);
  const geometry = useMemo(() => createHexnutGeometry(1.2, 0.6, 0.5), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * rotationSpeed;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={scale}
      rotation={initialRotation}
    >
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

interface PostFXOptions {
  scanlines?: boolean;
  scanlineOpacity?: number;
  vignette?: boolean;
  vignetteIntensity?: number;
  noise?: boolean;
  noiseOpacity?: number;
}

interface AsciiSceneProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  postfx?: PostFXOptions;
  debug?: boolean;
}

export function AsciiScene({
  width = "100%",
  height = "100%",
  className,
  postfx = {},
  debug = false,
}: AsciiSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Theme-specific configurations
  const themeConfigs = {
    dark: {
      lightX: -50,
      lightY: -50,
      lightZ: -31,
      intensity: 4,
      rotX: -0.7,
      rotY: 0.72,
      scale: 2.1,
      speed: 0.15,
      cameraZ: 6.8,
    },
    light: {
      lightX: 50,
      lightY: 50,
      lightZ: 50,
      intensity: 50,
      rotX: -0.7,
      rotY: 0.72,
      scale: 2.1,
      speed: 0.15,
      cameraZ: 6.8,
    },
  };

  const isDark = resolvedTheme === "dark";
  const currentConfig = isDark ? themeConfigs.dark : themeConfigs.light;

  // Debug state - initialized from theme config
  const [panelOpen, setPanelOpen] = useState(true);
  const [lightX, setLightX] = useState(currentConfig.lightX);
  const [lightY, setLightY] = useState(currentConfig.lightY);
  const [lightZ, setLightZ] = useState(currentConfig.lightZ);
  const [intensity, setIntensity] = useState(currentConfig.intensity);
  const [rotX, setRotX] = useState(currentConfig.rotX);
  const [rotY, setRotY] = useState(currentConfig.rotY);
  const [hexScale, setHexScale] = useState(currentConfig.scale);
  const [speed, setSpeed] = useState(currentConfig.speed);
  const [cameraZ, setCameraZ] = useState(currentConfig.cameraZ);

  // Sync state with theme when theme changes
  useEffect(() => {
    const config = isDark ? themeConfigs.dark : themeConfigs.light;
    setLightX(config.lightX);
    setLightY(config.lightY);
    setLightZ(config.lightZ);
    setIntensity(config.intensity);
    setRotX(config.rotX);
    setRotY(config.rotY);
    setHexScale(config.scale);
    setSpeed(config.speed);
    setCameraZ(config.cameraZ);
  }, [isDark]);

  // Always use state values (synced with theme or manually adjusted)
  const lightPosition: [number, number, number] = [lightX, lightY, lightZ];
  const lightIntensity = intensity;
  const initialRotation: [number, number, number] = [rotX, rotY, 0];

  const {
    scanlines = false,
    scanlineOpacity = 0.1,
    vignette = false,
    vignetteIntensity = 0,
    noise = false,
    noiseOpacity = 0.05,
  } = postfx;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Called when WebGL context is fully initialized
  const handleCreated = ({ gl }: { gl: THREE.WebGLRenderer }) => {
    // Ensure transparent clear color from the start
    gl.setClearColor(0x000000, 0);
    // Now safe to fade in
    setVisible(true);
  };

  if (!mounted) {
    return (
      <div ref={containerRef} className={className} style={{ width, height }} />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ascii-scene ${className || ""}`}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease-in-out",
      }}
    >
      <style>{asciiTransitionStyles}</style>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        onCreated={handleCreated}
      >
        <directionalLight position={lightPosition} intensity={lightIntensity} />

        <RotatingHexnut
          scale={hexScale}
          initialRotation={initialRotation}
          rotationSpeed={speed}
        />
        <OrbitControls enableDamping enableZoom={debug} enableRotate={true} />
      </Canvas>

      {/* Debug Panel - portaled to body to escape stacking contexts */}
      {debug &&
        createPortal(
          <div
            style={{
              position: "fixed",
              bottom: 16,
              right: 16,
              background: "rgba(0,0,0,0.9)",
              color: "#fff",
              padding: 8,
              borderRadius: 6,
              fontSize: 10,
              fontFamily: "monospace",
              zIndex: 2147483647,
              maxWidth: 180,
            }}
          >
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: 10,
                padding: 0,
                marginBottom: panelOpen ? 6 : 0,
              }}
            >
              {panelOpen ? "▼ Debug" : "▶ Debug"}
            </button>

            {panelOpen && (
              <>
                <label style={{ display: "block", marginBottom: 4 }}>
                  LightX: {lightX}
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={lightX}
                    onChange={(e) => setLightX(Number(e.target.value))}
                    style={{ width: "100%", height: 12 }}
                  />
                </label>
                <label style={{ display: "block", marginBottom: 4 }}>
                  LightY: {lightY}
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={lightY}
                    onChange={(e) => setLightY(Number(e.target.value))}
                    style={{ width: "100%", height: 12 }}
                  />
                </label>
                <label style={{ display: "block", marginBottom: 4 }}>
                  LightZ: {lightZ}
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={lightZ}
                    onChange={(e) => setLightZ(Number(e.target.value))}
                    style={{ width: "100%", height: 12 }}
                  />
                </label>
                <label style={{ display: "block", marginBottom: 4 }}>
                  Intensity: {intensity}
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={0.5}
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    style={{ width: "100%", height: 12 }}
                  />
                </label>
                <label style={{ display: "block", marginBottom: 4 }}>
                  RotX: {rotX.toFixed(2)}
                  <input
                    type="range"
                    min={-3.14}
                    max={3.14}
                    step={0.01}
                    value={rotX}
                    onChange={(e) => setRotX(Number(e.target.value))}
                    style={{ width: "100%", height: 12 }}
                  />
                </label>
                <label style={{ display: "block", marginBottom: 4 }}>
                  RotY: {rotY.toFixed(2)}
                  <input
                    type="range"
                    min={-3.14}
                    max={3.14}
                    step={0.01}
                    value={rotY}
                    onChange={(e) => setRotY(Number(e.target.value))}
                    style={{ width: "100%", height: 12 }}
                  />
                </label>
                <label style={{ display: "block", marginBottom: 4 }}>
                  Scale: {hexScale.toFixed(1)}
                  <input
                    type="range"
                    min={0.5}
                    max={5}
                    step={0.1}
                    value={hexScale}
                    onChange={(e) => setHexScale(Number(e.target.value))}
                    style={{ width: "100%", height: 12 }}
                  />
                </label>
                <label style={{ display: "block", marginBottom: 4 }}>
                  Speed: {speed.toFixed(2)}
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    style={{ width: "100%", height: 12 }}
                  />
                </label>
                <label style={{ display: "block", marginBottom: 4 }}>
                  CamZ: {cameraZ.toFixed(1)}
                  <input
                    type="range"
                    min={2}
                    max={15}
                    step={0.1}
                    value={cameraZ}
                    onChange={(e) => setCameraZ(Number(e.target.value))}
                    style={{ width: "100%", height: 12 }}
                  />
                </label>
                <div
                  style={{
                    marginTop: 6,
                    padding: 4,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 3,
                    fontSize: 9,
                    lineHeight: 1.4,
                  }}
                >
                  light: [{lightX}, {lightY}, {lightZ}]<br />
                  int: {intensity} | rot: [{rotX.toFixed(2)}, {rotY.toFixed(2)}]
                  <br />
                  scale: {hexScale.toFixed(1)} | spd: {speed.toFixed(2)} | cam:{" "}
                  {cameraZ.toFixed(1)}
                </div>
              </>
            )}
          </div>,
          document.body,
        )}

      {/* Scanlines overlay */}
      {scanlines && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, ${scanlineOpacity}) 2px,
              rgba(255, 255, 255, ${scanlineOpacity}) 4px
            )`,
            zIndex: 10,
          }}
        />
      )}

      {/* Vignette overlay */}
      {vignette && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(
              ellipse at center,
              transparent 0%,
              transparent 40%,
              rgba(0, 0, 0, ${vignetteIntensity}) 100%
            )`,
            zIndex: 11,
          }}
        />
      )}

      {/* Noise overlay */}
      {noise && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: noiseOpacity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            zIndex: 12,
          }}
        />
      )}
    </div>
  );
}
