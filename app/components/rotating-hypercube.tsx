import { useRef, useEffect, useState, useMemo, memo } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import {
  Edges,
  MeshPortalMaterial,
  Sky,
  RoundedBox,
  shaderMaterial,
} from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";

// Custom shader material for sun glow with fresnel effect
const SunGlowMaterial = shaderMaterial(
  {
    glowColor: new THREE.Color(0xffdd00),
    coefficient: 0.5,
    power: 3.0,
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vPositionNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 glowColor;
    uniform float coefficient;
    uniform float power;

    varying vec3 vNormal;
    varying vec3 vPositionNormal;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vPositionNormal);

      // Fresnel effect - glow at edges
      float intensity = pow(coefficient + abs(dot(normal, viewDir)), power);

      gl_FragColor = vec4(glowColor, 1.0) * intensity;
    }
  `,
);

extend({ SunGlowMaterial });

// Scene types for different scenic views
type SceneType = "sun" | "barGraph" | "dataTable" | "masonryGallery";

const SCENE_TYPES: SceneType[] = [
  "sun",
  "barGraph",
  "dataTable",
  "masonryGallery",
];

// Scene parameter types
interface SunSceneParams {
  sunX: number;
  sunY: number;
  sunZ: number;
  sunScale: number;
  cloudX: number;
  cloudY: number;
  cloudZ: number;
  cloudScale: number;
  skyTurbidity: number;
  ambientIntensity: number;
}

interface BarGraphSceneParams {
  barSpacing: number;
  barWidth: number;
  animSpeed: number;
  minHeightScale: number;
  maxHeightScale: number;
  graphX: number;
  graphY: number;
  graphZ: number;
  floorY: number;
  gridOpacity: number;
}

interface DataTableSceneParams {
  cardSpacing: number;
  cardWidth: number;
  cardHeight: number;
  cycleSpeed: number;
  highlightIntensity: number;
}

interface MasonryGallerySceneParams {
  numImages: number;
  gapRatio: number;
  hoverDistance: number;
  animSpeed: number;
  gridY: number;
  itemWidthRatio: number;
  itemHeightRatio: number;
  spotlightX: number;
  spotlightY: number;
  spotlightZ: number;
  spotlightIntensity: number;
  spotlightAngle: number;
  ambientIntensity: number;
}

interface AllSceneParams {
  sun: SunSceneParams;
  barGraph: BarGraphSceneParams;
  dataTable: DataTableSceneParams;
  masonryGallery: MasonryGallerySceneParams;
}

// Memoize puffs data outside component to avoid recreation
const CLOUD_PUFFS = [
  // Bottom row - base of cloud
  { pos: [-0.5, -0.15, 0] as [number, number, number], scale: 1.0 },
  { pos: [0, -0.15, 0] as [number, number, number], scale: 1.1 },
  { pos: [0.5, -0.15, 0] as [number, number, number], scale: 1.0 },

  // Middle row - main body
  { pos: [-0.6, 0, 0] as [number, number, number], scale: 0.95 },
  { pos: [-0.3, 0, 0.05] as [number, number, number], scale: 1.05 },
  { pos: [0, 0, -0.05] as [number, number, number], scale: 1.15 },
  { pos: [0.3, 0, 0.05] as [number, number, number], scale: 1.1 },
  { pos: [0.6, 0, 0] as [number, number, number], scale: 0.95 },

  // Top row - puffy top
  { pos: [-0.4, 0.18, 0] as [number, number, number], scale: 0.85 },
  { pos: [-0.1, 0.2, 0] as [number, number, number], scale: 0.95 },
  { pos: [0.2, 0.22, 0] as [number, number, number], scale: 0.9 },
  { pos: [0.5, 0.18, 0] as [number, number, number], scale: 0.8 },

  // Extra puffs for fullness
  { pos: [-0.2, 0.08, 0.1] as [number, number, number], scale: 0.75 },
  { pos: [0.35, 0.08, -0.1] as [number, number, number], scale: 0.7 },
];

// Large puffy cloud component for iOS-style weather icon - memoized for performance
const Cloud = memo(function Cloud({
  position,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}) {
  const cloudRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cloudRef.current) {
      // Very gentle floating animation
      cloudRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.08;
    }
  });

  return (
    <group ref={cloudRef} position={position} scale={scale}>
      {CLOUD_PUFFS.map((puff, i) => (
        <mesh
          key={i}
          position={puff.pos}
          scale={puff.scale}
          castShadow
          receiveShadow
          renderOrder={1}
        >
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={0.96}
            roughness={0.85}
            metalness={0}
            fog={false}
            depthWrite={true}
            depthTest={true}
          />
        </mesh>
      ))}
    </group>
  );
});

function SunScene({
  faceWidth,
  faceHeight,
  roomDepth,
  params,
}: {
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
  params: SunSceneParams;
}) {
  const sunRef = useRef<THREE.Group>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (sunRef.current) {
      // Gentle rotation of the sun
      sunRef.current.rotation.y += delta * 0.15;
    }
    if (coronaRef.current) {
      // Subtle pulsing of the corona
      const scale = 1 + Math.sin(_state.clock.elapsedTime * 0.5) * 0.05;
      coronaRef.current.scale.setScalar(scale);
    }
  });

  const skyScale = Math.max(faceWidth, faceHeight, roomDepth) * 10;

  // Calculate sun position based on params and roomDepth
  const sunPosition: [number, number, number] = [
    params.sunX,
    params.sunY,
    roomDepth * params.sunZ,
  ];

  return (
    <>
      {/* Atmospheric sky */}
      <Sky
        distance={4500}
        turbidity={params.skyTurbidity}
        rayleigh={4}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        sunPosition={[0, 10, -10]}
        azimuth={0.35}
      />

      {/* Enclosing sphere to ensure rich blue background */}
      <mesh scale={[skyScale, skyScale, skyScale]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#2563EB" side={THREE.BackSide} />
      </mesh>

      {/* Sun with enhanced shader-based glow - positioned to peek out from behind cloud */}
      {/* Positioned further back to prevent z-fighting with cloud */}
      <group ref={sunRef} position={sunPosition} scale={params.sunScale}>
        {/* Bright core sun sphere */}
        <mesh renderOrder={0}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial color="#FFFFF8" depthTest={true} />
        </mesh>

        {/* Inner bright ring */}
        <mesh scale={1.4} renderOrder={0}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial
            color="#FFEE44"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={true}
          />
        </mesh>

        {/* Close corona glow - intense */}
        <mesh scale={1.8} renderOrder={0}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial
            color="#FFDD22"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={true}
          />
        </mesh>

        {/* Corona glow using custom shader */}
        <mesh ref={coronaRef} scale={2.5} renderOrder={0}>
          <sphereGeometry args={[0.5, 32, 32]} />
          {/* @ts-expect-error - Custom shader material from extend */}
          <sunGlowMaterial
            transparent
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
            depthTest={true}
            glowColor={new THREE.Color(0xffdd00)}
            coefficient={0.25}
            power={2.0}
          />
        </mesh>

        {/* Mid glow layer - reduced intensity */}
        <mesh scale={3.5} renderOrder={0}>
          <sphereGeometry args={[0.5, 32, 32]} />
          {/* @ts-expect-error - Custom shader material from extend */}
          <sunGlowMaterial
            transparent
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
            depthTest={true}
            glowColor={new THREE.Color(0xffbb00)}
            coefficient={0.12}
            power={2.5}
          />
        </mesh>

        {/* Outer glow layer - softer */}
        <mesh scale={5.0} renderOrder={0}>
          <sphereGeometry args={[0.5, 32, 32]} />
          {/* @ts-expect-error - Custom shader material from extend */}
          <sunGlowMaterial
            transparent
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
            depthTest={true}
            glowColor={new THREE.Color(0xff9900)}
            coefficient={0.06}
            power={3.5}
          />
        </mesh>

        {/* Additional diffuse glow */}
        <mesh scale={2.0} renderOrder={0}>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshBasicMaterial
            color="#FFCC00"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={true}
          />
        </mesh>
      </group>

      {/* Enhanced sun lighting */}
      <ambientLight intensity={params.ambientIntensity} color="#FFF9E6" />

      {/* Main sun light from the sun position */}
      <pointLight
        position={sunPosition}
        intensity={10}
        color="#FFEE88"
        distance={15}
        decay={1.5}
        castShadow
      />

      {/* Directional light for cloud definition from sun position */}
      <directionalLight
        position={[
          sunPosition[0],
          sunPosition[1],
          sunPosition[2] + roomDepth * 0.07,
        ]}
        intensity={2.5}
        color="#FFE599"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Additional rim lights for atmosphere */}
      <pointLight
        position={[2, 1, -roomDepth * 0.4]}
        intensity={2}
        color="#FFD700"
        distance={10}
        decay={2}
      />
      <pointLight
        position={[-2, -1, -roomDepth * 0.4]}
        intensity={2}
        color="#FFD700"
        distance={10}
        decay={2}
      />

      {/* Single large puffy cloud - iOS weather icon style */}
      {/* Cloud is positioned clearly in front of sun with proper depth separation */}
      <Cloud
        position={[params.cloudX, params.cloudY, roomDepth * params.cloudZ]}
        scale={params.cloudScale}
        speed={0.6}
      />
    </>
  );
}

function BarGraphScene({
  faceWidth,
  faceHeight,
  roomDepth,
  params,
}: {
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
  params: BarGraphSceneParams;
}) {
  const barRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Store target scales and current scales for each bar
  const barStates = useRef<
    { current: number; target: number; speed: number }[]
  >([]);

  // Define bar data with different heights and colors
  const bars = [
    { height: 1.5, color: "#3B82F6", label: "A" },
    { height: 2.3, color: "#8B5CF6", label: "B" },
    { height: 1.8, color: "#EC4899", label: "C" },
    { height: 2.7, color: "#F59E0B", label: "D" },
    { height: 2.0, color: "#10B981", label: "E" },
  ];

  // Initialize bar states - preserve existing state to prevent re-initialization hitch
  const barsLength = bars.length;
  useEffect(() => {
    if (barStates.current.length !== barsLength) {
      barStates.current = Array.from(
        { length: barsLength },
        (_, i) =>
          barStates.current[i] || {
            current: 1,
            target:
              params.minHeightScale +
              Math.random() * (params.maxHeightScale - params.minHeightScale),
            speed: 0.3 + Math.random() * 0.4,
          },
      );
    }
  }, [barsLength, params.minHeightScale, params.maxHeightScale]);

  const totalWidth = bars.length * params.barSpacing;
  const startX = -totalWidth / 2 + params.barSpacing / 2;

  useFrame((state, delta) => {
    barRefs.current.forEach((bar, i) => {
      if (bar && barStates.current[i]) {
        const barState = barStates.current[i];

        // Smoothly animate towards target
        const lerpSpeed = delta * params.animSpeed * barState.speed;
        barState.current = THREE.MathUtils.lerp(
          barState.current,
          barState.target,
          lerpSpeed,
        );

        // If close to target, pick a new random target
        if (Math.abs(barState.current - barState.target) < 0.01) {
          barState.target =
            params.minHeightScale +
            Math.random() * (params.maxHeightScale - params.minHeightScale);
          barState.speed = 0.3 + Math.random() * 0.4; // Randomize speed too
        }

        // Scale the bar and adjust position so it grows from the bottom
        bar.scale.y = barState.current;
        // Adjust Y position to keep bottom anchored at y=0
        const baseHeight = bars[i].height;
        bar.position.y = (baseHeight * barState.current) / 2;
      }
    });
  });

  const skyScale = Math.max(faceWidth, faceHeight, roomDepth) * 10;

  return (
    <>
      {/* Dark gradient background */}
      <mesh scale={[skyScale, skyScale, skyScale]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#0F172A" side={THREE.BackSide} />
      </mesh>

      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={1} color="#ffffff" />

      {/* Grid floor */}
      <mesh
        position={[0, faceHeight * params.floorY, -roomDepth * 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[faceWidth * 3, roomDepth * 2, 20, 20]} />
        <meshStandardMaterial
          color="#1E293B"
          wireframe
          transparent
          opacity={params.gridOpacity}
        />
      </mesh>

      {/* Solid floor underneath */}
      <mesh
        position={[0, faceHeight * params.floorY - 0.01, -roomDepth * 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[faceWidth * 3, roomDepth * 2]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>

      {/* Bar graph */}
      <group
        position={[
          params.graphX,
          faceHeight * params.graphY,
          roomDepth * params.graphZ,
        ]}
      >
        {bars.map((bar, i) => {
          const xPos = startX + i * params.barSpacing;
          return (
            <group key={i} position={[xPos, 0, 0]}>
              {/* Bar */}
              <mesh
                ref={(el) => (barRefs.current[i] = el)}
                position={[0, bar.height / 2, 0]}
                castShadow
              >
                <boxGeometry
                  args={[params.barWidth, bar.height, params.barWidth]}
                />
                <meshStandardMaterial
                  color={bar.color}
                  emissive={bar.color}
                  emissiveIntensity={0.3}
                  metalness={0.3}
                  roughness={0.4}
                />
              </mesh>

              {/* Glow effect */}
              <pointLight
                position={[0, bar.height, 0]}
                intensity={0.5}
                color={bar.color}
                distance={1}
              />
            </group>
          );
        })}
      </group>

      {/* Back wall with subtle gradient */}
      <mesh position={[0, 0, -roomDepth]} rotation={[0, 0, 0]}>
        <planeGeometry args={[faceWidth * 3, faceHeight * 2]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
    </>
  );
}

function DataTableScene({
  faceWidth,
  faceHeight,
  roomDepth,
  params,
}: {
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
  params: DataTableSceneParams;
}) {
  const cardRefs = useRef<(THREE.Group | null)[]>([]);
  const highlightRef = useRef(0);

  // Sample data rows
  const dataRows = [
    { name: "Sarah Chen", category: "Engineering", value: "$95,420" },
    { name: "Marcus Johnson", category: "Sales", value: "$87,200" },
    { name: "Elena Rodriguez", category: "Marketing", value: "$78,900" },
    { name: "James Kim", category: "Product", value: "$92,500" },
    { name: "Aisha Patel", category: "Design", value: "$81,300" },
  ];

  const cardDepth = 0.08;
  const totalHeight = dataRows.length * params.cardSpacing;
  const startY = totalHeight / 2 - params.cardSpacing / 2;

  useFrame((state) => {
    // Cycle through cards for highlighting
    const cycleTime = params.cycleSpeed; // seconds per card
    const totalCycleTime = dataRows.length * cycleTime;
    const currentTime = state.clock.elapsedTime % totalCycleTime;
    const activeIndex = Math.floor(currentTime / cycleTime);

    cardRefs.current.forEach((card, i) => {
      if (card) {
        const isActive = i === activeIndex;
        const targetZ = isActive ? 0.15 : 0;

        // Smooth transition for Z position
        card.position.z = THREE.MathUtils.lerp(card.position.z, targetZ, 0.1);

        // Update highlight reference for material changes
        if (isActive) {
          highlightRef.current = i;
        }
      }
    });
  });

  const skyScale = Math.max(faceWidth, faceHeight, roomDepth) * 10;

  return (
    <>
      {/* Dark background */}
      <mesh scale={[skyScale, skyScale, skyScale]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#0F172A" side={THREE.BackSide} />
      </mesh>

      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2, 1]} intensity={0.8} color="#60A5FA" />

      {/* Grid background plane */}
      <mesh position={[0, 0, -roomDepth * 0.8]} rotation={[0, 0, 0]}>
        <planeGeometry args={[faceWidth * 2, faceHeight * 2, 15, 15]} />
        <meshStandardMaterial
          color="#1E293B"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 0, -roomDepth * 0.8 - 0.01]}>
        <planeGeometry args={[faceWidth * 2, faceHeight * 2]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>

      {/* Data cards */}
      <group position={[0, 0, -roomDepth * 0.4]}>
        {}
        {dataRows.map((row, i) => {
          const yPos = startY - i * params.cardSpacing;
          const zOffset = i * 0.02; // Subtle stagger

          return (
            <group
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              position={[0, yPos, zOffset]}
            >
              {/* Card base */}
              <mesh castShadow receiveShadow>
                <boxGeometry
                  args={[params.cardWidth, params.cardHeight, cardDepth]}
                />
                <meshStandardMaterial
                  color="#1E293B"
                  emissive="#3B82F6"
                  emissiveIntensity={
                    highlightRef.current === i
                      ? params.highlightIntensity
                      : 0.05
                  }
                  metalness={0.3}
                  roughness={0.5}
                  transparent
                  opacity={0.9}
                />
              </mesh>

              {/* Card border/frame */}
              <mesh position={[0, 0, cardDepth / 2 + 0.001]}>
                <planeGeometry
                  args={[params.cardWidth * 0.98, params.cardHeight * 0.85]}
                />
                <meshBasicMaterial
                  color="#60A5FA"
                  transparent
                  opacity={highlightRef.current === i ? 0.3 : 0.1}
                />
              </mesh>

              {/* Glow effect for active card */}
              {highlightRef.current === i && (
                <pointLight
                  position={[0, 0, 0.3]}
                  intensity={0.8}
                  color="#60A5FA"
                  distance={1.5}
                />
              )}

              {/* Text simulation using simple colored boxes */}
              {/* Name section (left) */}
              <mesh
                position={[-params.cardWidth * 0.28, 0, cardDepth / 2 + 0.002]}
              >
                <planeGeometry args={[0.5, 0.08]} />
                <meshBasicMaterial color="#E0E7FF" />
              </mesh>

              {/* Category section (middle) */}
              <mesh position={[0, 0, cardDepth / 2 + 0.002]}>
                <planeGeometry args={[0.35, 0.08]} />
                <meshBasicMaterial color="#93C5FD" />
              </mesh>

              {/* Value section (right) */}
              <mesh
                position={[params.cardWidth * 0.28, 0, cardDepth / 2 + 0.002]}
              >
                <planeGeometry args={[0.4, 0.08]} />
                <meshBasicMaterial color="#FBBF24" />
              </mesh>
            </group>
          );
        })}
      </group>
    </>
  );
}

type GradientType =
  | "linear-vertical"
  | "linear-horizontal"
  | "linear-diagonal"
  | "radial";

interface MasonryImage {
  width: number;
  height: number;
  x: number;
  y: number;
  gradientType: GradientType;
  color1: string;
  color2: string;
  color3?: string;
  hoverOffset: number;
  hoverSpeed: number;
}

// Global texture cache to prevent regenerating gradients on remount
const gradientTextureCache = new Map<string, THREE.CanvasTexture>();

// Global geometry cache to reuse box geometries across cards
const geometryCache = new Map<string, THREE.BoxGeometry>();

function getBoxGeometry(
  width: number,
  height: number,
  depth: number,
): THREE.BoxGeometry {
  const key = `${width}-${height}-${depth}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new THREE.BoxGeometry(width, height, depth));
  }
  return geometryCache.get(key)!;
}

function createGradientTexture(
  gradientType: GradientType,
  color1: string,
  color2: string,
  color3?: string,
): THREE.CanvasTexture {
  // Create cache key from parameters
  const cacheKey = `${gradientType}-${color1}-${color2}-${color3 || "none"}`;

  // Return cached texture if available
  if (gradientTextureCache.has(cacheKey)) {
    return gradientTextureCache.get(cacheKey)!;
  }

  // Generate new texture
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    // Fallback to a blank texture
    const texture = new THREE.CanvasTexture(canvas);
    gradientTextureCache.set(cacheKey, texture);
    return texture;
  }

  let gradient: CanvasGradient;

  switch (gradientType) {
    case "linear-vertical":
      gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      break;
    case "linear-horizontal":
      gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      break;
    case "linear-diagonal":
      gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      break;
    case "radial":
      gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
      );
      break;
  }

  gradient.addColorStop(0, color1);
  gradient.addColorStop(0.5, color2);
  if (color3) {
    gradient.addColorStop(1, color3);
  } else {
    gradient.addColorStop(1, color2);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // Cache for future use
  gradientTextureCache.set(cacheKey, texture);

  return texture;
}

function MasonryGalleryScene({
  faceWidth,
  faceHeight,
  roomDepth,
  params,
}: {
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
  params: MasonryGallerySceneParams;
}) {
  const carouselGroupRef = useRef<THREE.Group>(null);
  const imageRefs = useRef<(THREE.Group | null)[]>([]);

  // Generate horizontal carousel items
  const images = useMemo(() => {
    // Generate vibrant spectrum gradients (rainbow colors)
    const gradients: string[][] = [];
    const numGradients = 12;
    for (let i = 0; i < numGradients; i++) {
      const hue1 = (i * 360) / numGradients;
      const hue2 = ((i + 1) * 360) / numGradients;
      const color1 = `hsl(${hue1}, 85%, 58%)`;
      const color2 = `hsl(${hue2}, 85%, 58%)`;
      gradients.push([color1, color2]);
    }

    // Identical size for all carousel items
    const itemWidth = faceWidth * params.itemWidthRatio;
    const itemHeight = faceHeight * params.itemHeightRatio;
    const gap = faceWidth * params.gapRatio;
    const result: MasonryImage[] = [];

    // Create items positioned horizontally
    // We need double the items for seamless wrapping
    const totalItems = params.numImages * 2;
    for (let i = 0; i < totalItems; i++) {
      const x = i * (itemWidth + gap);
      const y = 0;

      // Use linear gradient and pick colors from spectrum
      const gradientType = "linear-vertical";
      const gradientColors = gradients[i % gradients.length];

      result.push({
        width: itemWidth,
        height: itemHeight,
        x,
        y,
        gradientType,
        color1: gradientColors[0],
        color2: gradientColors[1],
        color3: undefined,
        // Use deterministic "random" values based on index for stable animations
        hoverOffset: (i * 1.618033988749895) % (Math.PI * 2), // Golden ratio for distribution
        hoverSpeed: 0.5 + ((i * 0.1) % 0.5),
      });
    }

    return result;
  }, [
    faceWidth,
    faceHeight,
    params.numImages,
    params.gapRatio,
    params.itemWidthRatio,
    params.itemHeightRatio,
  ]);

  // Store current Z positions for each image and track which one is active
  const imageStates = useRef<{ current: number }[]>([]);
  const hoverState = useRef({
    activeIndex: -1,
  });
  const scrollOffset = useRef(0);

  // Initialize image states - preserve existing state to prevent re-initialization hitch
  useEffect(() => {
    if (imageStates.current.length !== images.length) {
      imageStates.current = Array.from(
        { length: images.length },
        (_, i) =>
          imageStates.current[i] || {
            current: 0,
          },
      );
    }
  }, [images.length]);

  useFrame((_, delta) => {
    // Perpetual scrolling to the left
    if (carouselGroupRef.current && images.length > 0) {
      const itemWidth = images[0].width;
      const gap = faceWidth * params.gapRatio;
      const itemSpacing = itemWidth + gap;
      const halfLength = params.numImages * itemSpacing;

      // Scroll speed based on animation speed parameter
      scrollOffset.current -= delta * params.animSpeed * 0.5;

      // Wrap around when we've scrolled past half the items (since we doubled them)
      if (scrollOffset.current <= -halfLength) {
        scrollOffset.current += halfLength;
      }

      carouselGroupRef.current.position.x = scrollOffset.current;

      // Find the item closest to center (x = 0 in world space)
      let closestIndex = 0;
      let minDistance = Infinity;

      images.forEach((img, i) => {
        // Calculate world X position of this item
        const worldX = scrollOffset.current + img.x;
        const distanceFromCenter = Math.abs(worldX);

        if (distanceFromCenter < minDistance) {
          minDistance = distanceFromCenter;
          closestIndex = i;
        }
      });

      // Update active index to the closest item
      hoverState.current.activeIndex = closestIndex;
    }

    // Update each image's Z position
    imageRefs.current.forEach((img, i) => {
      if (img && images[i] && imageStates.current[i]) {
        const imageState = imageStates.current[i];
        const isActive = i === hoverState.current.activeIndex;
        const targetZ = isActive ? params.hoverDistance : 0;

        // Smoothly animate towards target Z position
        const lerpSpeed = delta * params.animSpeed * 2;
        imageState.current = THREE.MathUtils.lerp(
          imageState.current,
          targetZ,
          lerpSpeed,
        );
        img.position.z = imageState.current;
      }
    });
  });

  const skyScale = Math.max(faceWidth, faceHeight, roomDepth) * 10;

  return (
    <>
      {/* Dark background */}
      <mesh scale={[skyScale, skyScale, skyScale]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#0F172A" side={THREE.BackSide} />
      </mesh>

      {/* Ambient lighting */}
      <ambientLight intensity={params.ambientIntensity} />
      <pointLight position={[0, 0, 1]} intensity={0.6} color="#ffffff" />

      {/* Adjustable spotlight */}
      <spotLight
        position={[params.spotlightX, params.spotlightY, params.spotlightZ]}
        intensity={params.spotlightIntensity}
        angle={params.spotlightAngle}
        penumbra={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Back wall */}
      <mesh position={[0, 0, -roomDepth * 0.7]} receiveShadow>
        <planeGeometry args={[faceWidth * 2.5, faceHeight * 3]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>

      {/* Horizontal carousel - scrolls perpetually to the left */}
      <group ref={carouselGroupRef} position={[0, 0, -roomDepth * 0.5]}>
        {images.map((img, i) => (
          <group
            key={i}
            ref={(el) => (imageRefs.current[i] = el)}
            position={[img.x, img.y, 0]}
          >
            <ImageCard
              width={img.width}
              height={img.height}
              gradientType={img.gradientType}
              color1={img.color1}
              color2={img.color2}
              color3={img.color3}
            />
          </group>
        ))}
      </group>
    </>
  );
}

function ImageCard({
  width,
  height,
  gradientType,
  color1,
  color2,
  color3,
}: {
  width: number;
  height: number;
  gradientType: GradientType;
  color1: string;
  color2: string;
  color3?: string;
}) {
  const depth = 0.05;

  // Use cached gradient texture to prevent regeneration on remount
  const gradientTexture = useMemo(
    () => createGradientTexture(gradientType, color1, color2, color3),
    [gradientType, color1, color2, color3],
  );

  // Use cached geometry to prevent recreation on remount
  const geometry = useMemo(
    () => getBoxGeometry(width, height, depth),
    [width, height, depth],
  );

  return (
    <group>
      {/* Base card - using simple box instead of RoundedBox for better performance */}
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial
          map={gradientTexture}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Subtle border */}
      <mesh position={[0, 0, depth / 2 + 0.001]}>
        <planeGeometry args={[width * 1.01, height * 1.01]} />
        <meshBasicMaterial
          color="#1E293B"
          opacity={0.2}
          transparent
          wireframe
        />
      </mesh>
    </group>
  );
}

function renderSceneContent(
  type: SceneType,
  faceWidth: number,
  faceHeight: number,
  roomDepth: number,
  sceneParams: AllSceneParams,
) {
  switch (type) {
    case "sun":
      return (
        <SunScene
          faceWidth={faceWidth}
          faceHeight={faceHeight}
          roomDepth={roomDepth}
          params={sceneParams.sun}
        />
      );
    case "barGraph":
      return (
        <BarGraphScene
          faceWidth={faceWidth}
          faceHeight={faceHeight}
          roomDepth={roomDepth}
          params={sceneParams.barGraph}
        />
      );
    case "dataTable":
      return (
        <DataTableScene
          faceWidth={faceWidth}
          faceHeight={faceHeight}
          roomDepth={roomDepth}
          params={sceneParams.dataTable}
        />
      );
    case "masonryGallery":
      return (
        <MasonryGalleryScene
          faceWidth={faceWidth}
          faceHeight={faceHeight}
          roomDepth={roomDepth}
          params={sceneParams.masonryGallery}
        />
      );
  }
}

const PLANE_OFFSET = 0.005; // Offset to prevent z-fighting and ensure proper rendering

const DEFAULT_CUBE_WIDTH = 4;
const DEFAULT_CUBE_HEIGHT = 3.4;
const DEFAULT_CUBE_DEPTH = 0.5;
const DEFAULT_ROOM_DEPTH = 2.5;
const DEFAULT_CAMERA_X = 4;
const DEFAULT_CAMERA_Y = 1;
const DEFAULT_CAMERA_Z = 4;
const DEFAULT_CAMERA_FOV = 50;
const DEFAULT_PAUSE_DURATION = 2;
const DEFAULT_CROSSFADE_DURATION = 0.5;
const DEFAULT_CUBE_ROTATION_X = 0;
const DEFAULT_CUBE_ROTATION_Y = 80;
const DEFAULT_CUBE_ROTATION_Z = 0;

export const App = ({ cubeWidth: propCubeWidth }: { cubeWidth?: number }) => {
  // Track when canvas is ready to prevent initial flash
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Scene Development Controls
  const sceneControls = useControls("Scene Development", {
    autoTransition: { value: true, label: "🔄 Auto Transition" },
    selectedScene: {
      value: "sun" as SceneType,
      options: [
        "sun",
        "barGraph",
        "dataTable",
        "masonryGallery",
      ] as SceneType[],
      label: "Selected Scene (manual mode)",
    },
  });

  // Sun Scene Controls
  const sunSceneControls = useControls(
    "Sun Scene",
    {
      sunX: { value: 0.3, min: -2, max: 2, step: 0.1, label: "Sun X Position" },
      sunY: { value: 0, min: -2, max: 2, step: 0.1, label: "Sun Y Position" },
      sunZ: {
        value: -0.4,
        min: -1,
        max: 0,
        step: 0.05,
        label: "Sun Z Position (depth)",
      },
      sunScale: { value: 0.9, min: 0.3, max: 3, step: 0.1, label: "Sun Scale" },
      cloudX: {
        value: 0.1,
        min: -2,
        max: 2,
        step: 0.1,
        label: "Cloud X Position",
      },
      cloudY: {
        value: -0.8,
        min: -2,
        max: 2,
        step: 0.1,
        label: "Cloud Y Position",
      },
      cloudZ: {
        value: -0.3,
        min: -1,
        max: 0,
        step: 0.05,
        label: "Cloud Z Position (depth)",
      },
      cloudScale: {
        value: 1.6,
        min: 0.5,
        max: 4,
        step: 0.1,
        label: "Cloud Scale",
      },
      skyTurbidity: {
        value: 19.0,
        min: 0,
        max: 20,
        step: 0.5,
        label: "Sky Turbidity",
      },
      ambientIntensity: {
        value: 1.8,
        min: 0,
        max: 3,
        step: 0.1,
        label: "Ambient Light",
      },
    },
    { collapsed: sceneControls.selectedScene !== "sun" },
  );

  // Bar Graph Scene Controls
  const barGraphSceneControls = useControls(
    "Bar Graph Scene",
    {
      graphX: {
        value: 0.0,
        min: -2,
        max: 2,
        step: 0.1,
        label: "Graph X Position",
      },
      graphY: {
        value: -0.4,
        min: -2,
        max: 2,
        step: 0.1,
        label: "Graph Y Position",
      },
      graphZ: {
        value: -0.2,
        min: -1,
        max: 0,
        step: 0.05,
        label: "Graph Z Position (depth)",
      },
      barSpacing: {
        value: 0.6,
        min: 0.2,
        max: 1.5,
        step: 0.05,
        label: "Bar Spacing",
      },
      barWidth: {
        value: 0.5,
        min: 0.1,
        max: 0.8,
        step: 0.05,
        label: "Bar Width",
      },
      animSpeed: {
        value: 2.0,
        min: 0,
        max: 3,
        step: 0.1,
        label: "Animation Speed",
      },
      minHeightScale: {
        value: 0.1,
        min: 0.1,
        max: 1,
        step: 0.05,
        label: "Min Height Scale",
      },
      maxHeightScale: {
        value: 1.5,
        min: 1,
        max: 3,
        step: 0.05,
        label: "Max Height Scale",
      },
      floorY: {
        value: -0.9,
        min: -1,
        max: 0,
        step: 0.05,
        label: "Floor Y Position",
      },
      gridOpacity: {
        value: 1.0,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Grid Opacity",
      },
    },
    { collapsed: sceneControls.selectedScene !== "barGraph" },
  );

  // Data Table Scene Controls
  const dataTableSceneControls = useControls(
    "Data Table Scene",
    {
      cardSpacing: {
        value: 0.65,
        min: 0.3,
        max: 1.2,
        step: 0.05,
        label: "Card Spacing",
      },
      cardWidth: { value: 3.0, min: 1, max: 4, step: 0.1, label: "Card Width" },
      cardHeight: {
        value: 0.65,
        min: 0.2,
        max: 0.8,
        step: 0.05,
        label: "Card Height",
      },
      cycleSpeed: {
        value: 0.5,
        min: 0.5,
        max: 3,
        step: 0.1,
        label: "Highlight Cycle Speed (sec)",
      },
      highlightIntensity: {
        value: 0.4,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Highlight Intensity",
      },
    },
    { collapsed: sceneControls.selectedScene !== "dataTable" },
  );

  // Carousel Scene Controls
  const masonrySceneControls = useControls(
    "Carousel Scene",
    {
      numImages: {
        value: 6,
        min: 3,
        max: 12,
        step: 1,
        label: "Number of Items",
      },
      itemWidthRatio: {
        value: 0.4,
        min: 0.1,
        max: 0.5,
        step: 0.01,
        label: "Item Width Ratio",
      },
      itemHeightRatio: {
        value: 0.4,
        min: 0.2,
        max: 1.0,
        step: 0.05,
        label: "Item Height Ratio",
      },
      gapRatio: {
        value: 0.05,
        min: 0.01,
        max: 0.15,
        step: 0.01,
        label: "Gap Size",
      },
      hoverDistance: {
        value: 0.7,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Hover Distance (Z)",
      },
      animSpeed: {
        value: 2.0,
        min: 0.5,
        max: 5,
        step: 0.1,
        label: "Scroll Speed",
      },
      gridY: {
        value: 0.5,
        min: -1,
        max: 2,
        step: 0.1,
        label: "Vertical Position",
      },
      ambientIntensity: {
        value: 1.2,
        min: 0,
        max: 3,
        step: 0.1,
        label: "Ambient Light",
      },
      spotlightX: {
        value: 2.2,
        min: -3,
        max: 3,
        step: 0.1,
        label: "Spotlight X",
      },
      spotlightY: {
        value: 1.6,
        min: -2,
        max: 3,
        step: 0.1,
        label: "Spotlight Y",
      },
      spotlightZ: {
        value: 0.8,
        min: -2,
        max: 2,
        step: 0.1,
        label: "Spotlight Z",
      },
      spotlightIntensity: {
        value: 10,
        min: 0,
        max: 10,
        step: 0.5,
        label: "Spotlight Intensity",
      },
      spotlightAngle: {
        value: 0.7,
        min: 0.1,
        max: 1.5,
        step: 0.05,
        label: "Spotlight Angle",
      },
    },
    { collapsed: sceneControls.selectedScene !== "masonryGallery" },
  );

  // Transition Controls
  const transitionControls = useControls("Transition", {
    pauseDuration: {
      value: DEFAULT_PAUSE_DURATION,
      min: 0,
      max: 10,
      step: 0.1,
      label: "Pause Between Transitions (sec)",
    },
    crossfadeDuration: {
      value: DEFAULT_CROSSFADE_DURATION,
      min: 0.1,
      max: 2,
      step: 0.1,
      label: "Crossfade Duration (sec)",
    },
    cubeRotationX: {
      value: DEFAULT_CUBE_ROTATION_X,
      min: -180,
      max: 180,
      step: 5,
      label: "Cube X Rotation",
    },
    cubeRotationY: {
      value: DEFAULT_CUBE_ROTATION_Y,
      min: -180,
      max: 180,
      step: 5,
      label: "Cube Y Rotation",
    },
    cubeRotationZ: {
      value: DEFAULT_CUBE_ROTATION_Z,
      min: -180,
      max: 180,
      step: 5,
      label: "Cube Z Rotation",
    },
  });

  // Camera Controls
  const cameraControls = useControls("Camera", {
    cameraX: { value: DEFAULT_CAMERA_X, min: -10, max: 10, step: 0.1 },
    cameraY: { value: DEFAULT_CAMERA_Y, min: -10, max: 10, step: 0.1 },
    cameraZ: { value: DEFAULT_CAMERA_Z, min: -10, max: 10, step: 0.1 },
    fov: { value: DEFAULT_CAMERA_FOV, min: 10, max: 120, step: 1 },
  });

  // Cube Dimensions
  const cubeControls = useControls("Cube Dimensions", {
    cubeWidth: {
      value: propCubeWidth ?? DEFAULT_CUBE_WIDTH,
      min: 0.5,
      max: 5,
      step: 0.1,
    },
    cubeHeight: { value: DEFAULT_CUBE_HEIGHT, min: 0.5, max: 5, step: 0.1 },
    cubeDepth: { value: DEFAULT_CUBE_DEPTH, min: 0.5, max: 5, step: 0.1 },
    roomDepth: { value: DEFAULT_ROOM_DEPTH, min: 1, max: 10, step: 0.1 },
    edgeRadius: {
      value: 0.3,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: "Edge Radius",
    },
    edgeSmoothness: {
      value: 10,
      min: 1,
      max: 10,
      step: 1,
      label: "Edge Smoothness",
    },
    edgeThreshold: {
      value: 137,
      min: 0,
      max: 180,
      step: 1,
      label: "Edge Line Threshold",
    },
    borderThickness: {
      value: 0.3,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: "Border Thickness",
    },
    glassOpacity: {
      value: 1.0,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Glass Opacity",
    },
    glassTransmission: {
      value: 1.0,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Glass Transmission",
    },
  });

  // Lighting Controls
  const lightingControls = useControls("Lighting", {
    keyLightX: {
      value: 10.0,
      min: -10,
      max: 15,
      step: 0.5,
      label: "Key Light X",
    },
    keyLightY: {
      value: 0.5,
      min: -10,
      max: 10,
      step: 0.5,
      label: "Key Light Y",
    },
    keyLightZ: {
      value: 7.0,
      min: -10,
      max: 10,
      step: 0.5,
      label: "Key Light Z",
    },
    keyLightIntensity: {
      value: 50.0,
      min: 0,
      max: 100,
      step: 0.5,
      label: "Key Light Intensity",
    },
    keyLightDistance: {
      value: 13,
      min: 0,
      max: 50,
      step: 1,
      label: "Key Light Distance",
    },
    keyLightDecay: {
      value: 0.0,
      min: 0,
      max: 3,
      step: 0.1,
      label: "Key Light Decay",
    },
    keyLightColor: { value: "#ffffff", label: "Key Light Color" },

    rimLightX: {
      value: -3.0,
      min: -10,
      max: 10,
      step: 0.5,
      label: "Rim Light X",
    },
    rimLightY: {
      value: 2.0,
      min: -10,
      max: 10,
      step: 0.5,
      label: "Rim Light Y",
    },
    rimLightZ: {
      value: -3.0,
      min: -10,
      max: 10,
      step: 0.5,
      label: "Rim Light Z",
    },
    rimLightIntensity: {
      value: 8.0,
      min: 0,
      max: 50,
      step: 0.5,
      label: "Rim Light Intensity",
    },
    rimLightDistance: {
      value: 20,
      min: 0,
      max: 50,
      step: 1,
      label: "Rim Light Distance",
    },
    rimLightDecay: {
      value: 0.9,
      min: 0,
      max: 3,
      step: 0.1,
      label: "Rim Light Decay",
    },
    rimLightColor: { value: "#88ccff", label: "Rim Light Color" },

    ambientIntensity: {
      value: 0.5,
      min: 0,
      max: 2,
      step: 0.1,
      label: "Ambient Intensity",
    },
  });

  // Glass Material Controls
  const glassControls = useControls("Glass Material", {
    ior: {
      value: 1.82,
      min: 1,
      max: 2.5,
      step: 0.01,
      label: "Index of Refraction (IOR)",
    },
    thickness: { value: 0.4, min: 0, max: 3, step: 0.1, label: "Thickness" },
    roughness: { value: 0, min: 0, max: 1, step: 0.01, label: "Roughness" },
    clearcoat: { value: 1.0, min: 0, max: 1, step: 0.01, label: "Clearcoat" },
    clearcoatRoughness: {
      value: 0.69,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Clearcoat Roughness",
    },
  });

  // Advanced Controls
  const advancedControls = useControls("Advanced", {
    worldUnits: false,
  });

  const controls = {
    ...sceneControls,
    ...transitionControls,
    ...cameraControls,
    ...cubeControls,
    ...lightingControls,
    ...glassControls,
    ...advancedControls,
    // Override cubeWidth with prop if provided
    ...(propCubeWidth !== undefined && { cubeWidth: propCubeWidth }),
  };

  const sceneParams = {
    sun: sunSceneControls,
    barGraph: barGraphSceneControls,
    dataTable: dataTableSceneControls,
    masonryGallery: masonrySceneControls,
  };

  return (
    <div style={{ width: "200px", height: "200px", position: "relative" }}>
      {/* Loading overlay - prevents flash during initialization */}
      {!isCanvasReady && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "transparent",
            zIndex: 10,
          }}
        />
      )}
      <Canvas
        shadows
        camera={{
          position: [controls.cameraX, controls.cameraY, controls.cameraZ],
          fov: controls.fov,
        }}
        style={{
          width: "200px",
          height: "200px",
          opacity: isCanvasReady ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: false, alpha: true }}
        onCreated={({ gl }) => {
          // Set clear color to transparent immediately to prevent white flash
          gl.setClearColor(0x000000, 0);
          // Canvas is ready - fade it in after a brief delay to ensure first frame is rendered
          setTimeout(() => setIsCanvasReady(true), 100);
        }}
      >
        {/* Controllable scene lighting for glass cube */}
        <ambientLight intensity={controls.ambientIntensity} />

        {/* Key light - main illumination with distance for diffuse spread */}
        <pointLight
          position={[
            controls.keyLightX,
            controls.keyLightY,
            controls.keyLightZ,
          ]}
          intensity={controls.keyLightIntensity}
          distance={controls.keyLightDistance}
          decay={controls.keyLightDecay}
          color={controls.keyLightColor}
          castShadow
        />

        {/* Rim light - highlights edges and creates depth */}
        <pointLight
          position={[
            controls.rimLightX,
            controls.rimLightY,
            controls.rimLightZ,
          ]}
          intensity={controls.rimLightIntensity}
          distance={controls.rimLightDistance}
          decay={controls.rimLightDecay}
          color={controls.rimLightColor}
        />

        <CameraController
          position={[controls.cameraX, controls.cameraY, controls.cameraZ]}
          fov={controls.fov}
        />
        <RotatingCube
          worldUnits={controls.worldUnits}
          cubeWidth={controls.cubeWidth}
          cubeHeight={controls.cubeHeight}
          cubeDepth={controls.cubeDepth}
          roomDepth={controls.roomDepth}
          pauseDuration={controls.pauseDuration}
          crossfadeDuration={controls.crossfadeDuration}
          cubeRotationX={controls.cubeRotationX}
          cubeRotationY={controls.cubeRotationY}
          cubeRotationZ={controls.cubeRotationZ}
          autoTransition={controls.autoTransition}
          selectedScene={controls.selectedScene}
          edgeRadius={controls.edgeRadius}
          edgeSmoothness={controls.edgeSmoothness}
          edgeThreshold={controls.edgeThreshold}
          borderThickness={controls.borderThickness}
          glassOpacity={controls.glassOpacity}
          glassTransmission={controls.glassTransmission}
          glassIor={controls.ior}
          glassThickness={controls.thickness}
          glassRoughness={controls.roughness}
          glassClearcoat={controls.clearcoat}
          glassClearcoatRoughness={controls.clearcoatRoughness}
          sceneParams={sceneParams}
        />
      </Canvas>
    </div>
  );
};

function CameraController({
  position,
  fov,
}: {
  position: [number, number, number];
  fov: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...position);
    if ("fov" in camera && camera.fov !== undefined) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, position, fov]);

  return null;
}

function RotatingCube({
  worldUnits,
  cubeWidth,
  cubeHeight,
  cubeDepth,
  roomDepth,
  pauseDuration,
  crossfadeDuration,
  cubeRotationX,
  cubeRotationY,
  cubeRotationZ,
  autoTransition,
  selectedScene,
  edgeRadius,
  edgeSmoothness,
  edgeThreshold,
  borderThickness,
  glassOpacity,
  glassTransmission,
  glassIor,
  glassThickness,
  glassRoughness,
  glassClearcoat,
  glassClearcoatRoughness,
  sceneParams,
}: {
  worldUnits: boolean;
  cubeWidth: number;
  cubeHeight: number;
  cubeDepth: number;
  roomDepth: number;
  pauseDuration: number;
  crossfadeDuration: number;
  cubeRotationX: number;
  cubeRotationY: number;
  cubeRotationZ: number;
  autoTransition: boolean;
  selectedScene: SceneType;
  edgeRadius: number;
  edgeSmoothness: number;
  edgeThreshold: number;
  borderThickness: number;
  glassOpacity: number;
  glassTransmission: number;
  glassIor: number;
  glassThickness: number;
  glassRoughness: number;
  glassClearcoat: number;
  glassClearcoatRoughness: number;
  sceneParams: AllSceneParams;
}) {
  const cubeGroupRef = useRef<THREE.Group>(null);

  // Transition state: tracks current scene, next scene, and opacity for crossfade
  const [currentScene, setCurrentScene] = useState<SceneType>(SCENE_TYPES[0]);
  const [nextScene, setNextScene] = useState<SceneType | null>(null);
  const [crossfadeOpacity, setCrossfadeOpacity] = useState(0); // 0 = current scene fully visible, 1 = next scene fully visible

  const transitionStateRef = useRef({
    pauseTimer: DEFAULT_PAUSE_DURATION, // Start with initial pause to show first scene
    isTransitioning: false,
    transitionTimer: 0,
    currentSceneIndex: 0,
  });

  // Calculate rotation in radians for direct application
  const cubeRotationRad = useMemo(
    () =>
      [
        THREE.MathUtils.degToRad(cubeRotationX),
        THREE.MathUtils.degToRad(cubeRotationY),
        THREE.MathUtils.degToRad(cubeRotationZ),
      ] as [number, number, number],
    [cubeRotationX, cubeRotationY, cubeRotationZ],
  );

  // Handle manual scene selection (when autoTransition is off)
  useEffect(() => {
    if (!autoTransition) {
      setCurrentScene(selectedScene);
      setNextScene(null);
      setCrossfadeOpacity(0);
      transitionStateRef.current.isTransitioning = false;
    }
  }, [selectedScene, autoTransition]);

  // Animation loop for auto-transition and crossfade
  useFrame((_, delta) => {
    if (!autoTransition) return;

    const transitionState = transitionStateRef.current;
    const cappedDelta = Math.min(delta, 0.1);

    // If we're paused, wait
    if (transitionState.pauseTimer > 0) {
      transitionState.pauseTimer -= cappedDelta;
      return;
    }

    // If we're not transitioning, start a new transition
    if (!transitionState.isTransitioning) {
      // Advance to next scene
      transitionState.currentSceneIndex =
        (transitionState.currentSceneIndex + 1) % SCENE_TYPES.length;
      const newNextScene = SCENE_TYPES[transitionState.currentSceneIndex];

      setNextScene(newNextScene);
      transitionState.isTransitioning = true;
      transitionState.transitionTimer = 0;
    }

    // Animate the crossfade
    if (transitionState.isTransitioning) {
      transitionState.transitionTimer += cappedDelta;
      const progress = Math.min(
        transitionState.transitionTimer / crossfadeDuration,
        1,
      );

      setCrossfadeOpacity(progress);

      // Check if transition is complete
      if (progress >= 1) {
        // Transition complete - swap scenes
        if (nextScene) {
          setCurrentScene(nextScene);
        }
        setNextScene(null);
        setCrossfadeOpacity(0);
        transitionState.isTransitioning = false;

        // Pause before next transition
        transitionState.pauseTimer = pauseDuration;
      }
    }
  });

  return (
    <group ref={cubeGroupRef} rotation={cubeRotationRad}>
      {/* Rounded glass-like cube with beveled edges */}
      <RoundedBox
        args={[
          cubeWidth + borderThickness,
          cubeHeight + borderThickness,
          cubeDepth + borderThickness,
        ]}
        radius={edgeRadius}
        smoothness={edgeSmoothness}
      >
        <meshPhysicalMaterial
          transparent
          opacity={glassOpacity}
          roughness={glassRoughness}
          metalness={0.1}
          clearcoat={glassClearcoat}
          clearcoatRoughness={glassClearcoatRoughness}
          transmission={glassTransmission}
          thickness={glassThickness}
          ior={glassIor}
          envMapIntensity={1.5}
          color="#ffffff"
        />
        <Edges threshold={edgeThreshold} color="#333333" />
      </RoundedBox>

      {/* Each face is a separate plane mesh with its own portal */}
      {/* All faces show the same scene with crossfade */}
      {/* Front face (positive Z) */}
      <Side
        position={[0, 0, cubeDepth / 2 + PLANE_OFFSET]}
        rotation={[0, 0, 0]}
        worldUnits={worldUnits}
        faceWidth={cubeWidth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        currentScene={currentScene}
        nextScene={nextScene}
        crossfadeOpacity={crossfadeOpacity}
        sceneParams={sceneParams}
      />

      {/* Back face (negative Z) */}
      <Side
        position={[0, 0, -cubeDepth / 2 - PLANE_OFFSET]}
        rotation={[0, Math.PI, 0]}
        worldUnits={worldUnits}
        faceWidth={cubeWidth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        currentScene={currentScene}
        nextScene={nextScene}
        crossfadeOpacity={crossfadeOpacity}
        sceneParams={sceneParams}
      />

      {/* Right face (positive X) */}
      <Side
        position={[cubeWidth / 2 + PLANE_OFFSET, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        worldUnits={worldUnits}
        faceWidth={cubeDepth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        currentScene={currentScene}
        nextScene={nextScene}
        crossfadeOpacity={crossfadeOpacity}
        sceneParams={sceneParams}
      />

      {/* Left face (negative X) */}
      <Side
        position={[-cubeWidth / 2 - PLANE_OFFSET, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        worldUnits={worldUnits}
        faceWidth={cubeDepth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        currentScene={currentScene}
        nextScene={nextScene}
        crossfadeOpacity={crossfadeOpacity}
        sceneParams={sceneParams}
      />

      {/* Top face (positive Y) */}
      <Side
        position={[0, cubeHeight / 2 + PLANE_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        worldUnits={worldUnits}
        faceWidth={cubeWidth}
        faceHeight={cubeDepth}
        roomDepth={roomDepth}
        currentScene={currentScene}
        nextScene={nextScene}
        crossfadeOpacity={crossfadeOpacity}
        sceneParams={sceneParams}
      />

      {/* Bottom face (negative Y) */}
      <Side
        position={[0, -cubeHeight / 2 - PLANE_OFFSET, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        worldUnits={worldUnits}
        faceWidth={cubeWidth}
        faceHeight={cubeDepth}
        roomDepth={roomDepth}
        currentScene={currentScene}
        nextScene={nextScene}
        crossfadeOpacity={crossfadeOpacity}
        sceneParams={sceneParams}
      />
    </group>
  );
}

function Side({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  worldUnits = false,
  faceWidth,
  faceHeight,
  roomDepth,
  currentScene,
  nextScene,
  crossfadeOpacity,
  sceneParams,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  worldUnits?: boolean;
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
  currentScene: SceneType;
  nextScene: SceneType | null;
  crossfadeOpacity: number;
  sceneParams: AllSceneParams;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  // Determine which scene to show based on crossfade progress
  // For a quick crossfade: show current scene until halfway, then switch to next
  const displayScene =
    nextScene && crossfadeOpacity > 0.5 ? nextScene : currentScene;

  // Calculate fade overlay opacity for smooth transition
  // Fade out in first half, fade in during second half
  const overlayOpacity =
    nextScene && crossfadeOpacity > 0
      ? crossfadeOpacity <= 0.5
        ? crossfadeOpacity * 2 // Fade to black (0 to 1)
        : (1 - crossfadeOpacity) * 2 // Fade from black (1 to 0)
      : 0;

  return (
    <mesh ref={mesh} position={position} rotation={rotation} renderOrder={0}>
      <planeGeometry args={[faceWidth * 1.001, faceHeight * 1.001]} />
      <MeshPortalMaterial worldUnits={worldUnits} blur={0} resolution={128}>
        {/** Everything in here is inside the portal and isolated from the canvas */}

        {/* Render the active scene */}
        {renderSceneContent(
          displayScene,
          faceWidth,
          faceHeight,
          roomDepth,
          sceneParams,
        )}

        {/* Fade overlay for smooth transitions */}
        {overlayOpacity > 0 && (
          <mesh position={[0, 0, 1]} renderOrder={1000}>
            <planeGeometry args={[faceWidth * 10, faceHeight * 10]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={overlayOpacity}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        )}
      </MeshPortalMaterial>
    </mesh>
  );
}
