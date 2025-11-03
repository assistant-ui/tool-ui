import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import {
  Edges,
  MeshPortalMaterial,
  Environment,
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
  cornerRadius: number;
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

// Large puffy cloud component for iOS-style weather icon
function Cloud({
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

  // Create large puffy cloud from multiple spheres - iOS weather icon style
  const puffs = [
    // Bottom row - base of cloud
    { pos: [-0.5, -0.15, 0], scale: 1.0 },
    { pos: [0, -0.15, 0], scale: 1.1 },
    { pos: [0.5, -0.15, 0], scale: 1.0 },

    // Middle row - main body
    { pos: [-0.6, 0, 0], scale: 0.95 },
    { pos: [-0.3, 0, 0.05], scale: 1.05 },
    { pos: [0, 0, -0.05], scale: 1.15 },
    { pos: [0.3, 0, 0.05], scale: 1.1 },
    { pos: [0.6, 0, 0], scale: 0.95 },

    // Top row - puffy top
    { pos: [-0.4, 0.18, 0], scale: 0.85 },
    { pos: [-0.1, 0.2, 0], scale: 0.95 },
    { pos: [0.2, 0.22, 0], scale: 0.9 },
    { pos: [0.5, 0.18, 0], scale: 0.8 },

    // Extra puffs for fullness
    { pos: [-0.2, 0.08, 0.1], scale: 0.75 },
    { pos: [0.35, 0.08, -0.1], scale: 0.7 },
  ];

  return (
    <group ref={cloudRef} position={position} scale={scale}>
      {puffs.map((puff, i) => (
        <mesh
          key={i}
          position={puff.pos as [number, number, number]}
          scale={puff.scale}
          castShadow
          receiveShadow
          renderOrder={1}
        >
          <sphereGeometry args={[0.35, 24, 24]} />
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
}

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
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#2563EB" side={THREE.BackSide} />
      </mesh>

      {/* Sun with enhanced shader-based glow - positioned to peek out from behind cloud */}
      {/* Positioned further back to prevent z-fighting with cloud */}
      <group ref={sunRef} position={sunPosition} scale={params.sunScale}>
        {/* Bright core sun sphere */}
        <mesh renderOrder={0}>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshBasicMaterial color="#FFFFF8" depthTest={true} />
        </mesh>

        {/* Inner bright ring */}
        <mesh scale={1.4} renderOrder={0}>
          <sphereGeometry args={[0.5, 64, 64]} />
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
          <sphereGeometry args={[0.5, 64, 64]} />
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
          <sphereGeometry args={[0.5, 64, 64]} />
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
          <sphereGeometry args={[0.5, 64, 64]} />
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
          <sphereGeometry args={[0.5, 64, 64]} />
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
          <sphereGeometry args={[0.5, 32, 32]} />
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

  // Initialize bar states
  if (barStates.current.length === 0) {
    barStates.current = bars.map(() => ({
      current: 1,
      target:
        params.minHeightScale +
        Math.random() * (params.maxHeightScale - params.minHeightScale),
      speed: 0.3 + Math.random() * 0.4,
    }));
  }

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
        <sphereGeometry args={[1, 64, 64]} />
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
        <sphereGeometry args={[1, 64, 64]} />
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
        hoverOffset: Math.random() * Math.PI * 2,
        hoverSpeed: 0.5 + Math.random() * 0.5,
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

  // Initialize image states
  if (imageStates.current.length === 0) {
    imageStates.current = images.map(() => ({
      current: 0,
    }));
  }

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
        <sphereGeometry args={[1, 64, 64]} />
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
              cornerRadius={params.cornerRadius}
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
  cornerRadius,
}: {
  width: number;
  height: number;
  gradientType: GradientType;
  color1: string;
  color2: string;
  color3?: string;
  cornerRadius: number;
}) {
  const depth = 0.05;

  // Create gradient texture
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

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
    return texture;
  }, [gradientType, color1, color2, color3]);

  return (
    <group>
      {/* Base card with rounded corners and gradient */}
      <RoundedBox
        args={[width, height, depth]}
        radius={cornerRadius}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={gradientTexture}
          metalness={0.1}
          roughness={0.6}
        />
      </RoundedBox>

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

// Default values
const DEFAULT_CUBE_WIDTH = 4;
const DEFAULT_CUBE_HEIGHT = 3.4;
const DEFAULT_CUBE_DEPTH = 0.5;
const DEFAULT_ROOM_DEPTH = 2.5;
const DEFAULT_CAMERA_X = 4;
const DEFAULT_CAMERA_Y = 1; // Lowered to be more level with the cube
const DEFAULT_CAMERA_Z = 4;
const DEFAULT_CAMERA_FOV = 50;
const DEFAULT_ROTATION_SPEED = 6;
const DEFAULT_PAUSE_DURATION = 1;
const DEFAULT_INITIAL_ROTATION_X = 0;
const DEFAULT_INITIAL_ROTATION_Y = 80;
const DEFAULT_INITIAL_ROTATION_Z = 0;

export const App = ({ cubeWidth: propCubeWidth }: { cubeWidth?: number }) => {
  // Scene Development Controls
  const sceneControls = useControls("Scene Development", {
    locked: { value: false, label: "🔒 Lock Rotation" },
    selectedScene: {
      value: "sun" as SceneType,
      options: [
        "sun",
        "barGraph",
        "dataTable",
        "masonryGallery",
      ] as SceneType[],
      label: "Scene to View",
    },
    showAllFaces: {
      value: false,
      label: "Different Scenes Per Face",
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
        value: 3.0,
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
      cornerRadius: {
        value: 0.03,
        min: 0,
        max: 0.1,
        step: 0.005,
        label: "Corner Radius",
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

  // Rotation Controls
  const rotationControls = useControls("Rotation", {
    manualRotationY: {
      value: DEFAULT_INITIAL_ROTATION_Y,
      min: -180,
      max: 180,
      step: 5,
      label: "Y Rotation (Front=80, Back=-100, Left=-10, Right=170)",
    },
    rotationSpeed: {
      value: DEFAULT_ROTATION_SPEED,
      min: 0.1,
      max: 10,
      step: 0.1,
      label: "Auto Rotation Speed",
    },
    pauseDuration: {
      value: DEFAULT_PAUSE_DURATION,
      min: 0,
      max: 10,
      step: 0.1,
      label: "Pause Between Rotations",
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
  });

  // Advanced Controls
  const advancedControls = useControls("Advanced", {
    worldUnits: false,
    initialRotationX: {
      value: DEFAULT_INITIAL_ROTATION_X,
      min: -180,
      max: 180,
      step: 1,
    },
    initialRotationY: {
      value: DEFAULT_INITIAL_ROTATION_Y,
      min: -180,
      max: 180,
      step: 1,
    },
    initialRotationZ: {
      value: DEFAULT_INITIAL_ROTATION_Z,
      min: -180,
      max: 180,
      step: 1,
    },
  });

  const controls = {
    ...sceneControls,
    ...rotationControls,
    ...cameraControls,
    ...cubeControls,
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
    <div style={{ width: "200px", height: "200px" }}>
      <Canvas
        shadows
        camera={{
          position: [controls.cameraX, controls.cameraY, controls.cameraZ],
          fov: controls.fov,
        }}
        style={{ width: "200px", height: "200px" }}
      >
        {/* Fixed camera looking at origin */}
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <ambientLight intensity={0.5} />

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
          rotationSpeed={controls.rotationSpeed}
          pauseDuration={controls.pauseDuration}
          initialRotationX={controls.initialRotationX}
          initialRotationY={controls.initialRotationY}
          initialRotationZ={controls.initialRotationZ}
          locked={controls.locked}
          selectedScene={controls.selectedScene}
          manualRotationY={controls.manualRotationY}
          showAllFaces={controls.showAllFaces}
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
  rotationSpeed,
  pauseDuration,
  initialRotationX,
  initialRotationY,
  initialRotationZ,
  locked,
  selectedScene,
  manualRotationY,
  showAllFaces,
  sceneParams,
}: {
  worldUnits: boolean;
  cubeWidth: number;
  cubeHeight: number;
  cubeDepth: number;
  roomDepth: number;
  rotationSpeed: number;
  pauseDuration: number;
  initialRotationX: number;
  initialRotationY: number;
  initialRotationZ: number;
  locked: boolean;
  selectedScene: SceneType;
  manualRotationY: number;
  showAllFaces: boolean;
  sceneParams: AllSceneParams;
}) {
  const cubeGroupRef = useRef<THREE.Group>(null);

  // Helper function to calculate scene for each face based on rotation state
  const getSceneForFace = (
    faceId: "front" | "back" | "left" | "right",
    rotationCount: number,
    currentSceneIndex: number,
  ): SceneType => {
    const isEvenRotation = rotationCount % 2 === 0;

    if (isEvenRotation) {
      // Even rotations: Front+Left show current scene, Back+Right show next scene
      if (faceId === "front" || faceId === "left") {
        return SCENE_TYPES[currentSceneIndex];
      } else {
        return SCENE_TYPES[(currentSceneIndex + 1) % SCENE_TYPES.length];
      }
    } else {
      // Odd rotations: Back+Right show current scene, Front+Left show next scene
      if (faceId === "back" || faceId === "right") {
        return SCENE_TYPES[currentSceneIndex];
      } else {
        return SCENE_TYPES[(currentSceneIndex + 1) % SCENE_TYPES.length];
      }
    }
  };

  // State to track scene type for each face
  const [faceScenes, setFaceScenes] = useState<{
    front: SceneType;
    back: SceneType;
    left: SceneType;
    right: SceneType;
    top: SceneType;
    bottom: SceneType;
  }>(() => {
    const firstScene = SCENE_TYPES[0];
    return {
      // Start with first scene on all faces
      // The rotation logic will update hidden faces before each rotation
      front: firstScene,
      back: firstScene,
      left: firstScene,
      right: firstScene,
      top: firstScene,
      bottom: firstScene,
    };
  });

  // Update face scenes when selectedScene changes (if locked and not showing all faces)
  useEffect(() => {
    if (locked && !showAllFaces) {
      setFaceScenes({
        front: selectedScene,
        back: selectedScene,
        left: selectedScene,
        right: selectedScene,
        top: selectedScene,
        bottom: selectedScene,
      });
    }
  }, [selectedScene, showAllFaces, locked]);

  // Convert degrees to radians for initial rotation
  const initialRotationRadX = THREE.MathUtils.degToRad(initialRotationX);
  const initialRotationRadY = THREE.MathUtils.degToRad(initialRotationY);
  const initialRotationRadZ = THREE.MathUtils.degToRad(initialRotationZ);

  const rotationStateRef = useRef({
    targetRotation: new THREE.Euler(
      initialRotationRadX,
      initialRotationRadY,
      initialRotationRadZ,
    ),
    currentRotation: new THREE.Euler(
      initialRotationRadX,
      initialRotationRadY,
      initialRotationRadZ,
    ),
    isRotating: false,
    rotationCount: 0,
    pauseTimer: 0,
    pauseDuration: pauseDuration,
    currentSceneIndex: 0, // Tracks which scene is currently visible to camera
  });

  // Update pause duration when it changes
  useEffect(() => {
    rotationStateRef.current.pauseDuration = pauseDuration;
  }, [pauseDuration]);

  // Update initial rotation when controls change (only if not currently rotating)
  useEffect(() => {
    const initialRotationRadX = THREE.MathUtils.degToRad(initialRotationX);
    const initialRotationRadY = THREE.MathUtils.degToRad(initialRotationY);
    const initialRotationRadZ = THREE.MathUtils.degToRad(initialRotationZ);

    if (!rotationStateRef.current.isRotating) {
      rotationStateRef.current.currentRotation.set(
        initialRotationRadX,
        initialRotationRadY,
        initialRotationRadZ,
      );
      rotationStateRef.current.targetRotation.set(
        initialRotationRadX,
        initialRotationRadY,
        initialRotationRadZ,
      );
      if (cubeGroupRef.current) {
        cubeGroupRef.current.rotation.copy(
          rotationStateRef.current.currentRotation,
        );
      }
    }
  }, [initialRotationX, initialRotationY, initialRotationZ]);

  useFrame((_, delta) => {
    if (!cubeGroupRef.current) return;

    const rotationState = rotationStateRef.current;

    // If locked, use manual rotation
    if (locked) {
      const manualRotationRadY = THREE.MathUtils.degToRad(manualRotationY);
      cubeGroupRef.current.rotation.set(
        rotationState.currentRotation.x,
        manualRotationRadY,
        rotationState.currentRotation.z,
      );
      return;
    }

    // If we're paused, wait
    if (rotationState.pauseTimer > 0) {
      rotationState.pauseTimer -= delta;
      return;
    }

    // If we're not rotating, start a new rotation
    if (!rotationState.isRotating) {
      // FIRST: Update scenes for the next cycle BEFORE starting rotation
      // Advance to next scene
      rotationState.currentSceneIndex =
        (rotationState.currentSceneIndex + 1) % SCENE_TYPES.length;
      const nextScene = SCENE_TYPES[rotationState.currentSceneIndex];

      // Update face scenes based on current mode
      // This happens BEFORE rotation starts, so the hidden faces get new scenes
      if (showAllFaces) {
        // Different scenes per face - use complex logic
        rotationState.rotationCount++;
        setFaceScenes({
          front: getSceneForFace(
            "front",
            rotationState.rotationCount,
            rotationState.currentSceneIndex,
          ),
          back: getSceneForFace(
            "back",
            rotationState.rotationCount,
            rotationState.currentSceneIndex,
          ),
          left: getSceneForFace(
            "left",
            rotationState.rotationCount,
            rotationState.currentSceneIndex,
          ),
          right: getSceneForFace(
            "right",
            rotationState.rotationCount,
            rotationState.currentSceneIndex,
          ),
          top: SCENE_TYPES[rotationState.currentSceneIndex],
          bottom: SCENE_TYPES[rotationState.currentSceneIndex],
        });
      } else {
        // Cycle through scenes by alternating which face gets updated
        // We rotate 180° each time, so we alternate between viewing front and back
        // - Even rotationCount: viewing front, will rotate to back, so update back + sides
        // - Odd rotationCount: viewing back, will rotate to front, so update front + sides
        const isEvenRotation = rotationState.rotationCount % 2 === 0;

        if (isEvenRotation) {
          // Update back face and all side faces with the next scene
          // (all currently hidden or partially visible, will become fully visible after rotation)
          setFaceScenes((prev) => ({
            ...prev,
            back: nextScene,
            left: nextScene,
            right: nextScene,
            top: nextScene,
            bottom: nextScene,
          }));
        } else {
          // Update front face and all side faces with the next scene
          // (all currently hidden or partially visible, will become fully visible after rotation)
          setFaceScenes((prev) => ({
            ...prev,
            front: nextScene,
            left: nextScene,
            right: nextScene,
            top: nextScene,
            bottom: nextScene,
          }));
        }

        rotationState.rotationCount++;
      }

      // THEN: Start the rotation
      rotationState.isRotating = true;

      // Rotate only on Y axis (horizontal rotation)
      const current = rotationState.currentRotation;

      rotationState.targetRotation.set(
        current.x,
        current.y + Math.PI, // 180 degrees rotation
        current.z,
      );
    }

    // Smoothly rotate towards target
    const current = rotationState.currentRotation;
    const target = rotationState.targetRotation;
    const speed = rotationSpeed;

    current.x = THREE.MathUtils.lerp(current.x, target.x, delta * speed);
    current.y = THREE.MathUtils.lerp(current.y, target.y, delta * speed);
    current.z = THREE.MathUtils.lerp(current.z, target.z, delta * speed);

    // Check if we've reached the target (within a small threshold)
    const threshold = 0.01;
    if (
      Math.abs(current.x - target.x) < threshold &&
      Math.abs(current.y - target.y) < threshold &&
      Math.abs(current.z - target.z) < threshold
    ) {
      // Rotation completed - snap to exact target
      rotationState.currentRotation.copy(target);
      rotationState.isRotating = false;

      // Pause before next rotation
      rotationState.pauseTimer = rotationState.pauseDuration;
    }

    cubeGroupRef.current.rotation.copy(rotationState.currentRotation);
  });

  return (
    <group ref={cubeGroupRef}>
      {/* Wireframe edges for visual reference */}
      <group renderOrder={-1}>
        <mesh>
          <boxGeometry args={[cubeWidth, cubeHeight, cubeDepth]} />
          <meshBasicMaterial visible={false} />
        </mesh>
        <Edges />
      </group>

      {/* Each face is a separate plane mesh with its own portal */}
      {/* Front face (positive Z) */}
      <Side
        position={[0, 0, cubeDepth / 2 + PLANE_OFFSET]}
        rotation={[0, 0, 0]}
        bg="orange"
        worldUnits={worldUnits}
        faceWidth={cubeWidth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        sceneType={faceScenes.front}
        sceneParams={sceneParams}
      />

      {/* Back face (negative Z) */}
      <Side
        position={[0, 0, -cubeDepth / 2 - PLANE_OFFSET]}
        rotation={[0, Math.PI, 0]}
        bg="lightblue"
        worldUnits={worldUnits}
        faceWidth={cubeWidth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        sceneType={faceScenes.back}
        sceneParams={sceneParams}
      />

      {/* Right face (positive X) */}
      <Side
        position={[cubeWidth / 2 + PLANE_OFFSET, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        bg="lightgreen"
        worldUnits={worldUnits}
        faceWidth={cubeDepth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        sceneType={faceScenes.right}
        sceneParams={sceneParams}
      />

      {/* Left face (negative X) */}
      <Side
        position={[-cubeWidth / 2 - PLANE_OFFSET, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        bg="aquamarine"
        worldUnits={worldUnits}
        faceWidth={cubeDepth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        sceneType={faceScenes.left}
        sceneParams={sceneParams}
      />

      {/* Top face (positive Y) */}
      <Side
        position={[0, cubeHeight / 2 + PLANE_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        bg="indianred"
        worldUnits={worldUnits}
        faceWidth={cubeWidth}
        faceHeight={cubeDepth}
        roomDepth={roomDepth}
        sceneType={faceScenes.top}
        sceneParams={sceneParams}
      />

      {/* Bottom face (negative Y) */}
      <Side
        position={[0, -cubeHeight / 2 - PLANE_OFFSET, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        bg="hotpink"
        worldUnits={worldUnits}
        faceWidth={cubeWidth}
        faceHeight={cubeDepth}
        roomDepth={roomDepth}
        sceneType={faceScenes.bottom}
        sceneParams={sceneParams}
      />
    </group>
  );
}

function Side({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  bg = "#f0f0f0",
  worldUnits = false,
  faceWidth,
  faceHeight,
  roomDepth,
  sceneType,
  sceneParams,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  bg?: string;
  worldUnits?: boolean;
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
  sceneType: SceneType;
  sceneParams: AllSceneParams;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const portalGroup = useRef<THREE.Group>(null);

  // Determine if this is a scenic scene (doesn't need room structure)
  const isScenicScene =
    sceneType === "sun" ||
    sceneType === "barGraph" ||
    sceneType === "dataTable" ||
    sceneType === "masonryGallery";

  useFrame((_, delta) => {
    if (mesh.current && !isScenicScene) {
      // Only rotate geometry scenes, not scenic scenes
      mesh.current.rotation.x += delta;
      mesh.current.rotation.y += delta;
    }
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation} renderOrder={0}>
      <planeGeometry args={[faceWidth * 1.001, faceHeight * 1.001]} />
      <MeshPortalMaterial worldUnits={worldUnits} blur={0} resolution={512}>
        {/** Everything in here is inside the portal and isolated from the canvas */}
        {!isScenicScene && <ambientLight intensity={0.5} />}
        {!isScenicScene && <Environment preset="city" />}

        {isScenicScene ? (
          // Render scenic scene directly (no room structure)
          renderSceneContent(
            sceneType,
            faceWidth,
            faceHeight,
            roomDepth,
            sceneParams,
          )
        ) : (
          // Render room structure for geometry scenes
          <>
            {/** Room walls - create a box room looking inward */}
            <group ref={portalGroup}>
              {/* Back wall (far end of room) */}
              <mesh position={[0, 0, -roomDepth]} rotation={[0, 0, 0]}>
                <planeGeometry args={[faceWidth * 2, faceHeight * 2]} />
                <meshStandardMaterial
                  color={bg}
                  roughness={0.8}
                  metalness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Floor */}
              <mesh
                position={[0, -faceHeight, -roomDepth / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[faceWidth * 2, roomDepth]} />
                <meshStandardMaterial
                  color={bg}
                  roughness={0.8}
                  metalness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Ceiling */}
              <mesh
                position={[0, faceHeight, -roomDepth / 2]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[faceWidth * 2, roomDepth]} />
                <meshStandardMaterial
                  color={bg}
                  roughness={0.8}
                  metalness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Left wall */}
              <mesh
                position={[-faceWidth, 0, -roomDepth / 2]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <planeGeometry args={[roomDepth, faceHeight * 2]} />
                <meshStandardMaterial
                  color={bg}
                  roughness={0.8}
                  metalness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Right wall */}
              <mesh
                position={[faceWidth, 0, -roomDepth / 2]}
                rotation={[0, -Math.PI / 2, 0]}
              >
                <planeGeometry args={[roomDepth, faceHeight * 2]} />
                <meshStandardMaterial
                  color={bg}
                  roughness={0.8}
                  metalness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Lighting - positioned at the front of the room */}
              <spotLight
                castShadow
                color={bg}
                intensity={2}
                position={[0, faceHeight * 0.7, -0.5]}
                angle={0.8}
                penumbra={1}
                shadow-normalBias={0.05}
                shadow-bias={0.0001}
              />

              {/* The main shape - positioned in the center of the room */}
              <mesh
                castShadow
                receiveShadow
                ref={mesh}
                position={[0, 0, -roomDepth * 0.6]}
              >
                {renderSceneContent(
                  sceneType,
                  faceWidth,
                  faceHeight,
                  roomDepth,
                  sceneParams,
                )}
                <meshLambertMaterial color={bg} />
              </mesh>
            </group>
          </>
        )}
      </MeshPortalMaterial>
    </mesh>
  );
}
