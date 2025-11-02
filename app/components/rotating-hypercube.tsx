import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Edges,
  MeshPortalMaterial,
  Environment,
  Sky,
  RoundedBox,
} from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";

// Scene types for different scenic views
type SceneType = "sun" | "barGraph" | "dataTable" | "masonryGallery";

const SCENE_TYPES: SceneType[] = [
  "sun",
  "barGraph",
  "dataTable",
  "masonryGallery",
];

function SunScene({
  faceWidth,
  faceHeight,
  roomDepth,
}: {
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
}) {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (sunRef.current) {
      // Gentle rotation of the sun
      sunRef.current.rotation.y += delta * 0.2;
    }
  });

  const skyScale = Math.max(faceWidth, faceHeight, roomDepth) * 10;

  return (
    <>
      {/* Atmospheric sky */}
      <Sky
        distance={4500}
        turbidity={10}
        rayleigh={3}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        sunPosition={[0, 10, -10]}
        azimuth={0.35}
      />

      {/* Enclosing sphere to ensure rich blue background */}
      <mesh scale={[skyScale, skyScale, skyScale]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#1E3A8A" side={THREE.BackSide} />
      </mesh>

      {/* Glowing sun sphere */}
      <mesh ref={sunRef} position={[0, 0, -roomDepth * 0.4]}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFA500"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Glow effect around the sun */}
      <mesh position={[0, 0, -roomDepth * 0.4]}>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={1}
          transparent
          opacity={0.3}
          roughness={0}
        />
      </mesh>

      {/* Ambient light from the sun */}
      <ambientLight intensity={0.9} color="#FFEFD5" />
      <pointLight
        position={[0, 0, -roomDepth * 0.4]}
        intensity={3}
        color="#FFD700"
        distance={10}
        decay={2}
      />

      {/* Subtle ground haze */}
      <mesh
        position={[0, -faceHeight * 0.4, -roomDepth * 0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[faceWidth * 4, faceWidth * 4]} />
        <meshStandardMaterial
          color="#FDE68A"
          transparent
          opacity={0.2}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </>
  );
}

function BarGraphScene({
  faceWidth,
  faceHeight,
  roomDepth,
}: {
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
}) {
  const barRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Define bar data with different heights and colors
  const bars = [
    { height: 1.5, color: "#3B82F6", label: "A" },
    { height: 2.3, color: "#8B5CF6", label: "B" },
    { height: 1.8, color: "#EC4899", label: "C" },
    { height: 2.7, color: "#F59E0B", label: "D" },
    { height: 2.0, color: "#10B981", label: "E" },
  ];

  const barWidth = 0.3;
  const barSpacing = 0.5;
  const totalWidth = bars.length * barSpacing;
  const startX = -totalWidth / 2 + barSpacing / 2;

  useFrame((state) => {
    barRefs.current.forEach((bar, i) => {
      if (bar) {
        // Gentle pulsing animation
        const pulseSpeed = 0.5 + i * 0.1;
        const pulse = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.05 + 1;
        bar.scale.y = pulse;
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
        position={[0, -faceHeight * 0.4, -roomDepth * 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[faceWidth * 3, roomDepth * 2, 20, 20]} />
        <meshStandardMaterial
          color="#1E293B"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Solid floor underneath */}
      <mesh
        position={[0, -faceHeight * 0.4 - 0.01, -roomDepth * 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[faceWidth * 3, roomDepth * 2]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>

      {/* Bar graph */}
      <group position={[0, -faceHeight * 0.2, -roomDepth * 0.5]}>
        {bars.map((bar, i) => {
          const xPos = startX + i * barSpacing;
          return (
            <group key={i} position={[xPos, 0, 0]}>
              {/* Bar */}
              <mesh
                ref={(el) => (barRefs.current[i] = el)}
                position={[0, bar.height / 2, 0]}
                castShadow
              >
                <boxGeometry args={[barWidth, bar.height, barWidth]} />
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
}: {
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
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

  const cardHeight = 0.4;
  const cardWidth = 2.2;
  const cardDepth = 0.08;
  const cardSpacing = 0.55;
  const totalHeight = dataRows.length * cardSpacing;
  const startY = totalHeight / 2 - cardSpacing / 2;

  useFrame((state) => {
    // Cycle through cards for highlighting
    const cycleTime = 1; // seconds per card
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
          const yPos = startY - i * cardSpacing;
          const zOffset = i * 0.02; // Subtle stagger

          return (
            <group
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              position={[0, yPos, zOffset]}
            >
              {/* Card base */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[cardWidth, cardHeight, cardDepth]} />
                <meshStandardMaterial
                  color="#1E293B"
                  emissive="#3B82F6"
                  emissiveIntensity={highlightRef.current === i ? 0.4 : 0.05}
                  metalness={0.3}
                  roughness={0.5}
                  transparent
                  opacity={0.9}
                />
              </mesh>

              {/* Card border/frame */}
              <mesh position={[0, 0, cardDepth / 2 + 0.001]}>
                <planeGeometry args={[cardWidth * 0.98, cardHeight * 0.85]} />
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
              <mesh position={[-cardWidth * 0.28, 0, cardDepth / 2 + 0.002]}>
                <planeGeometry args={[0.5, 0.08]} />
                <meshBasicMaterial color="#E0E7FF" />
              </mesh>

              {/* Category section (middle) */}
              <mesh position={[0, 0, cardDepth / 2 + 0.002]}>
                <planeGeometry args={[0.35, 0.08]} />
                <meshBasicMaterial color="#93C5FD" />
              </mesh>

              {/* Value section (right) */}
              <mesh position={[cardWidth * 0.28, 0, cardDepth / 2 + 0.002]}>
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
  pulseOffset: number;
  pulseSpeed: number;
}

function MasonryGalleryScene({
  faceWidth,
  faceHeight,
  roomDepth,
}: {
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
}) {
  const imageRefs = useRef<(THREE.Group | null)[]>([]);

  // Generate masonry layout
  const { images, gridHeight } = useMemo(() => {
    const gradientTypes: GradientType[] = [
      "linear-vertical",
      "linear-horizontal",
      "linear-diagonal",
      "radial",
    ];

    const gradients = [
      ["#667eea", "#764ba2", "#f093fb"], // Purple to pink
      ["#f093fb", "#f5576c"], // Pink gradient
      ["#4facfe", "#00f2fe"], // Blue gradient
      ["#43e97b", "#38f9d7"], // Green gradient
      ["#fa709a", "#fee140"], // Pink to yellow
      ["#30cfd0", "#330867"], // Teal to purple
      ["#a8edea", "#fed6e3"], // Light teal to pink
      ["#ff9a9e", "#fecfef", "#fecfef"], // Pink soft
      ["#ffecd2", "#fcb69f"], // Peach
      ["#ff6e7f", "#bfe9ff"], // Red to blue
      ["#e0c3fc", "#8ec5fc"], // Purple to blue
      ["#fbc2eb", "#a6c1ee"], // Pink to blue
    ];

    const numColumns = 3;
    // Scale based on face dimensions
    const gapRatio = 0.05; // Gap as percentage of width
    const gap = faceWidth * gapRatio;
    const columnWidth =
      (faceWidth * 0.85 - gap * (numColumns - 1)) / numColumns;
    const totalWidth = numColumns * columnWidth + (numColumns - 1) * gap;
    const startX = -totalWidth / 2 + columnWidth / 2;

    // Calculate height variants based on face height to fill space
    const baseHeight = faceHeight * 0.8;
    const heightVariants = [
      baseHeight * 0.8,
      baseHeight * 0.4,
      baseHeight * 0.5,
      baseHeight * 0.3,
      baseHeight * 0.7,
    ];

    // Track column heights for masonry algorithm
    const columnHeights = new Array(numColumns).fill(0);
    const result: MasonryImage[] = [];

    // Generate 6 images
    for (let i = 0; i < 6; i++) {
      const height =
        heightVariants[Math.floor(Math.random() * heightVariants.length)];
      const width = columnWidth;

      // Find shortest column
      const shortestColIndex = columnHeights.indexOf(
        Math.min(...columnHeights),
      );

      // Calculate position
      const x = startX + shortestColIndex * (columnWidth + gap);
      const y = -columnHeights[shortestColIndex] - height / 2;

      // Random gradient type and colors
      const gradientType =
        gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
      const gradientColors =
        gradients[Math.floor(Math.random() * gradients.length)];

      result.push({
        width,
        height,
        x,
        y,
        gradientType,
        color1: gradientColors[0],
        color2: gradientColors[1],
        color3: gradientColors[2],
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 0.5,
      });

      // Update column height
      columnHeights[shortestColIndex] += height + gap;
    }

    // Calculate total grid height (tallest column)
    const totalGridHeight = Math.max(...columnHeights);

    return { images: result, gridHeight: totalGridHeight };
  }, [faceWidth, faceHeight]);

  useFrame((state) => {
    imageRefs.current.forEach((img, i) => {
      if (img && images[i]) {
        const { pulseOffset, pulseSpeed } = images[i];
        const pulse =
          Math.sin(state.clock.elapsedTime * pulseSpeed + pulseOffset) * 0.04 +
          1;
        img.scale.set(pulse, pulse, 1);
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
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 1]} intensity={0.6} color="#ffffff" />

      {/* Back wall */}
      <mesh position={[0, 0, -roomDepth * 0.7]}>
        <planeGeometry args={[faceWidth * 2.5, faceHeight * 3]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>

      {/* Masonry grid - centered vertically */}
      <group position={[0, gridHeight / 2, -roomDepth * 0.5]}>
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
  const radius = 0.02; // Rounded corner radius

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
        radius={radius}
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
) {
  switch (type) {
    case "sun":
      return (
        <SunScene
          faceWidth={faceWidth}
          faceHeight={faceHeight}
          roomDepth={roomDepth}
        />
      );
    case "barGraph":
      return (
        <BarGraphScene
          faceWidth={faceWidth}
          faceHeight={faceHeight}
          roomDepth={roomDepth}
        />
      );
    case "dataTable":
      return (
        <DataTableScene
          faceWidth={faceWidth}
          faceHeight={faceHeight}
          roomDepth={roomDepth}
        />
      );
    case "masonryGallery":
      return (
        <MasonryGalleryScene
          faceWidth={faceWidth}
          faceHeight={faceHeight}
          roomDepth={roomDepth}
        />
      );
  }
}

const PLANE_OFFSET = 0.005; // Offset to prevent z-fighting and ensure proper rendering

// Default values
const DEFAULT_CUBE_WIDTH = 3;
const DEFAULT_CUBE_HEIGHT = 4;
const DEFAULT_CUBE_DEPTH = 1;
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

export const App = () => {
  const controls = useControls({
    worldUnits: false,
    cameraX: { value: DEFAULT_CAMERA_X, min: -10, max: 10, step: 0.1 },
    cameraY: { value: DEFAULT_CAMERA_Y, min: -10, max: 10, step: 0.1 },
    cameraZ: { value: DEFAULT_CAMERA_Z, min: -10, max: 10, step: 0.1 },
    fov: { value: DEFAULT_CAMERA_FOV, min: 10, max: 120, step: 1 },
    cubeWidth: { value: DEFAULT_CUBE_WIDTH, min: 0.5, max: 5, step: 0.1 },
    cubeHeight: { value: DEFAULT_CUBE_HEIGHT, min: 0.5, max: 5, step: 0.1 },
    cubeDepth: { value: DEFAULT_CUBE_DEPTH, min: 0.5, max: 5, step: 0.1 },
    roomDepth: { value: DEFAULT_ROOM_DEPTH, min: 1, max: 10, step: 0.1 },
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
    rotationSpeed: {
      value: DEFAULT_ROTATION_SPEED,
      min: 0.1,
      max: 10,
      step: 0.1,
    },
    pauseDuration: {
      value: DEFAULT_PAUSE_DURATION,
      min: 0,
      max: 10,
      step: 0.1,
    },
  });

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
    const secondScene = SCENE_TYPES[1];
    return {
      front: firstScene,
      back: secondScene,
      left: firstScene,
      right: secondScene,
      top: firstScene,
      bottom: firstScene,
    };
  });

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

  useFrame(({ camera }, delta) => {
    if (!cubeGroupRef.current) return;

    const rotationState = rotationStateRef.current;

    // If we're paused, wait
    if (rotationState.pauseTimer > 0) {
      rotationState.pauseTimer -= delta;
      return;
    }

    // If we're not rotating, start a new rotation
    if (!rotationState.isRotating) {
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

      // Increment rotation count and advance to next scene
      rotationState.rotationCount++;
      rotationState.currentSceneIndex =
        (rotationState.currentSceneIndex + 1) % SCENE_TYPES.length;

      // Update all face scenes based on new rotation state
      // This updates the faces that are now non-visible (facing away from camera)
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
        lookDirection={[0, 0, -1]}
        faceWidth={cubeWidth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        sceneType={faceScenes.front}
      />

      {/* Back face (negative Z) */}
      <Side
        position={[0, 0, -cubeDepth / 2 - PLANE_OFFSET]}
        rotation={[0, Math.PI, 0]}
        bg="lightblue"
        worldUnits={worldUnits}
        lookDirection={[0, 0, 1]}
        faceWidth={cubeWidth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        sceneType={faceScenes.back}
      />

      {/* Right face (positive X) */}
      <Side
        position={[cubeWidth / 2 + PLANE_OFFSET, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        bg="lightgreen"
        worldUnits={worldUnits}
        lookDirection={[-1, 0, 0]}
        faceWidth={cubeDepth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        sceneType={faceScenes.right}
      />

      {/* Left face (negative X) */}
      <Side
        position={[-cubeWidth / 2 - PLANE_OFFSET, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        bg="aquamarine"
        worldUnits={worldUnits}
        lookDirection={[1, 0, 0]}
        faceWidth={cubeDepth}
        faceHeight={cubeHeight}
        roomDepth={roomDepth}
        sceneType={faceScenes.left}
      />

      {/* Top face (positive Y) */}
      <Side
        position={[0, cubeHeight / 2 + PLANE_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        bg="indianred"
        worldUnits={worldUnits}
        lookDirection={[0, -1, 0]}
        faceWidth={cubeWidth}
        faceHeight={cubeDepth}
        roomDepth={roomDepth}
        sceneType={faceScenes.top}
      />

      {/* Bottom face (negative Y) */}
      <Side
        position={[0, -cubeHeight / 2 - PLANE_OFFSET, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        bg="hotpink"
        worldUnits={worldUnits}
        lookDirection={[0, 1, 0]}
        faceWidth={cubeWidth}
        faceHeight={cubeDepth}
        roomDepth={roomDepth}
        sceneType={faceScenes.bottom}
      />
    </group>
  );
}

function Side({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  bg = "#f0f0f0",
  worldUnits = false,
  lookDirection = [0, 0, -1],
  faceWidth,
  faceHeight,
  roomDepth,
  sceneType,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  bg?: string;
  worldUnits?: boolean;
  lookDirection?: [number, number, number];
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
  sceneType: SceneType;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const portalGroup = useRef<THREE.Group>(null);

  // Determine if this is a scenic scene (doesn't need room structure)
  const isScenicScene =
    sceneType === "sun" ||
    sceneType === "barGraph" ||
    sceneType === "dataTable" ||
    sceneType === "masonryGallery";

  useFrame((state, delta) => {
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
          renderSceneContent(sceneType, faceWidth, faceHeight, roomDepth)
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
