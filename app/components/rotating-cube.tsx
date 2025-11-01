"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useControls, folder } from "leva";
import * as THREE from "three";

function Cube() {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotationRef = useRef({
    x: 0,
    y: 0,
    z: 0,
  });
  const rotationIndexRef = useRef(0);

  // Leva Controls - Cube Geometry
  const cubeGeometry = useControls("Cube Geometry", {
    size: { value: 2, min: 0.5, max: 5, step: 0.1 },
    cornerRadius: { value: 0.22, min: 0, max: 0.5, step: 0.01 },
    smoothness: { value: 10, min: 1, max: 20, step: 1 },
  });

  // Leva Controls - Cube Material
  const cubeMaterial = useControls("Cube Material", {
    "Face Colors": folder({
      rightColor: { value: "#ff6b6b", label: "Right (Red)" },
      leftColor: { value: "#4ecdc4", label: "Left (Teal)" },
      topColor: { value: "#45b7d1", label: "Top (Blue)" },
      bottomColor: { value: "#f9ca24", label: "Bottom (Yellow)" },
      frontColor: { value: "#95e1d3", label: "Front (Mint)" },
      backColor: { value: "#c44569", label: "Back (Pink)" },
    }),
    "Material Properties": folder({
      metalness: { value: 0.3, min: 0, max: 1, step: 0.01 },
      roughness: { value: 0.2, min: 0, max: 1, step: 0.01 },
      clearcoat: { value: 0.5, min: 0, max: 1, step: 0.01 },
      clearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    }),
  });

  // Leva Controls - Shape Material
  const shapeMaterialControls = useControls("Shape Material", {
    shapeColor: { value: "#ffffff", label: "Color" },
    shapeMetalness: { value: 0.4, min: 0, max: 1, step: 0.01 },
    shapeRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    shapeClearcoat: { value: 0.8, min: 0, max: 1, step: 0.01 },
    shapeClearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    emissiveIntensity: { value: 0.1, min: 0, max: 1, step: 0.01 },
  });

  // Leva Controls - Animation
  const animation = useControls("Animation", {
    "Rotation Settings": folder({
      intervalMs: {
        value: 2500,
        min: 500,
        max: 10000,
        step: 100,
        label: "Interval (ms)",
      },
      lerpFactor: {
        value: 0.1,
        min: 0.01,
        max: 0.2,
        step: 0.01,
        label: "Smoothness",
      },
      use90Degrees: { value: true, label: "Use 90°" },
      use180Degrees: { value: true, label: "Use 180°" },
    }),
    "Initial Rotation": folder({
      initialX: {
        value: 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
        label: "X (radians)",
      },
      initialY: {
        value: 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
        label: "Y (radians)",
      },
      initialZ: {
        value: 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
        label: "Z (radians)",
      },
    }),
  });

  // Build rotation increments based on controls
  const ROTATION_INCREMENTS = [];
  if (animation.use90Degrees) ROTATION_INCREMENTS.push(Math.PI / 2);
  if (animation.use180Degrees) ROTATION_INCREMENTS.push(Math.PI);
  if (ROTATION_INCREMENTS.length === 0) ROTATION_INCREMENTS.push(Math.PI / 2);

  const ROTATION_PATTERNS = [
    { axis: "y", label: "horizontal" },
    { axis: "x", label: "vertical" },
    { axis: "z", label: "roll" },
  ];

  // Update initial rotation
  useEffect(() => {
    targetRotationRef.current = {
      x: animation.initialX,
      y: animation.initialY,
      z: animation.initialZ,
    };
  }, [animation.initialX, animation.initialY, animation.initialZ]);

  // Generate fixed angular rotations
  useEffect(() => {
    const interval = setInterval(() => {
      if (groupRef.current) {
        const pattern =
          ROTATION_PATTERNS[
            rotationIndexRef.current % ROTATION_PATTERNS.length
          ];
        const increment =
          ROTATION_INCREMENTS[
            Math.floor(Math.random() * ROTATION_INCREMENTS.length)
          ];

        const newTarget = { ...targetRotationRef.current };
        if (pattern.axis === "x") {
          newTarget.x = groupRef.current.rotation.x + increment;
        } else if (pattern.axis === "y") {
          newTarget.y = groupRef.current.rotation.y + increment;
        } else {
          newTarget.z = groupRef.current.rotation.z + increment;
        }

        targetRotationRef.current = newTarget;
        rotationIndexRef.current++;
      }
    }, animation.intervalMs);

    return () => clearInterval(interval);
  }, [animation.intervalMs, ROTATION_INCREMENTS]);

  // Smoothly interpolate rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotationRef.current.x,
        animation.lerpFactor,
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationRef.current.y,
        animation.lerpFactor,
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotationRef.current.z,
        animation.lerpFactor,
      );
    }
  });

  // Create materials with controls
  const materials = [
    new THREE.MeshPhysicalMaterial({
      color: cubeMaterial.rightColor,
      metalness: cubeMaterial.metalness,
      roughness: cubeMaterial.roughness,
      clearcoat: cubeMaterial.clearcoat,
      clearcoatRoughness: cubeMaterial.clearcoatRoughness,
    }),
    new THREE.MeshPhysicalMaterial({
      color: cubeMaterial.leftColor,
      metalness: cubeMaterial.metalness,
      roughness: cubeMaterial.roughness,
      clearcoat: cubeMaterial.clearcoat,
      clearcoatRoughness: cubeMaterial.clearcoatRoughness,
    }),
    new THREE.MeshPhysicalMaterial({
      color: cubeMaterial.topColor,
      metalness: cubeMaterial.metalness,
      roughness: cubeMaterial.roughness,
      clearcoat: cubeMaterial.clearcoat,
      clearcoatRoughness: cubeMaterial.clearcoatRoughness,
    }),
    new THREE.MeshPhysicalMaterial({
      color: cubeMaterial.bottomColor,
      metalness: cubeMaterial.metalness,
      roughness: cubeMaterial.roughness,
      clearcoat: cubeMaterial.clearcoat,
      clearcoatRoughness: cubeMaterial.clearcoatRoughness,
    }),
    new THREE.MeshPhysicalMaterial({
      color: cubeMaterial.frontColor,
      metalness: cubeMaterial.metalness,
      roughness: cubeMaterial.roughness,
      clearcoat: cubeMaterial.clearcoat,
      clearcoatRoughness: cubeMaterial.clearcoatRoughness,
    }),
    new THREE.MeshPhysicalMaterial({
      color: cubeMaterial.backColor,
      metalness: cubeMaterial.metalness,
      roughness: cubeMaterial.roughness,
      clearcoat: cubeMaterial.clearcoat,
      clearcoatRoughness: cubeMaterial.clearcoatRoughness,
    }),
  ];

  // Material for the decorative shapes
  const shapeMaterial = new THREE.MeshPhysicalMaterial({
    color: shapeMaterialControls.shapeColor,
    metalness: shapeMaterialControls.shapeMetalness,
    roughness: shapeMaterialControls.shapeRoughness,
    clearcoat: shapeMaterialControls.shapeClearcoat,
    clearcoatRoughness: shapeMaterialControls.shapeClearcoatRoughness,
    emissive: shapeMaterialControls.shapeColor,
    emissiveIntensity: shapeMaterialControls.emissiveIntensity,
  });

  const shapeOffset = cubeGeometry.size / 2 + 0.01;

  return (
    <group ref={groupRef}>
      <RoundedBox
        args={[cubeGeometry.size, cubeGeometry.size, cubeGeometry.size]}
        radius={cubeGeometry.cornerRadius}
        smoothness={cubeGeometry.smoothness}
        material={materials}
      />

      {/* Add shapes to each face */}
      <mesh position={[0, 0, shapeOffset]}>
        <circleGeometry args={[0.5, 32]} />
        <primitive object={shapeMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 0, -shapeOffset]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <primitive object={shapeMaterial} attach="material" />
      </mesh>

      <mesh position={[shapeOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <primitive object={shapeMaterial} attach="material" />
      </mesh>

      <mesh position={[-shapeOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <primitive object={shapeMaterial} attach="material" />
      </mesh>

      <mesh position={[0, shapeOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.1, 16, 32]} />
        <primitive object={shapeMaterial} attach="material" />
      </mesh>

      <mesh
        position={[0, -shapeOffset, 0]}
        rotation={[Math.PI / 2, 0, Math.PI / 4]}
      >
        <octahedronGeometry args={[0.4]} />
        <primitive object={shapeMaterial} attach="material" />
      </mesh>
    </group>
  );
}

function Scene() {
  // Leva Controls - Lighting
  const lighting = useControls("Lighting", {
    "Ambient Light": folder({
      ambientIntensity: { value: 1.2, min: 0, max: 2, step: 0.1 },
    }),
    "Directional Light 1": folder({
      dir1X: { value: 14.5, min: -20, max: 20, step: 0.5, label: "X Position" },
      dir1Y: { value: -3.0, min: -20, max: 20, step: 0.5, label: "Y Position" },
      dir1Z: { value: 8.0, min: -20, max: 20, step: 0.5, label: "Z Position" },
      dir1Intensity: {
        value: 1.5,
        min: 0,
        max: 3,
        step: 0.1,
        label: "Intensity",
      },
    }),
    "Directional Light 2": folder({
      dir2X: { value: 10.5, min: -20, max: 20, step: 0.5, label: "X Position" },
      dir2Y: { value: -2.0, min: -20, max: 20, step: 0.5, label: "Y Position" },
      dir2Z: { value: 5.5, min: -20, max: 20, step: 0.5, label: "Z Position" },
      dir2Intensity: {
        value: 1.3,
        min: 0,
        max: 3,
        step: 0.1,
        label: "Intensity",
      },
    }),
    "Point Light": folder({
      pointX: {
        value: 20.0,
        min: -20,
        max: 30,
        step: 0.5,
        label: "X Position",
      },
      pointY: { value: 7.5, min: -20, max: 20, step: 0.5, label: "Y Position" },
      pointZ: { value: 6.0, min: -20, max: 20, step: 0.5, label: "Z Position" },
      pointIntensity: {
        value: 2.3,
        min: 0,
        max: 3,
        step: 0.1,
        label: "Intensity",
      },
    }),
    "Spot Light": folder({
      spotY: { value: -0.5, min: -20, max: 20, step: 0.5, label: "Y Position" },
      spotAngle: {
        value: 0.45,
        min: 0,
        max: Math.PI / 2,
        step: 0.05,
        label: "Angle",
      },
      spotPenumbra: {
        value: 0.3,
        min: 0,
        max: 1,
        step: 0.1,
        label: "Penumbra",
      },
      spotIntensity: {
        value: 2.7,
        min: 0,
        max: 3,
        step: 0.1,
        label: "Intensity",
      },
    }),
  });

  return (
    <>
      {/* Enhanced lighting for specular effects */}
      <ambientLight intensity={lighting.ambientIntensity} />
      <directionalLight
        position={[lighting.dir1X, lighting.dir1Y, lighting.dir1Z]}
        intensity={lighting.dir1Intensity}
        castShadow
      />
      <directionalLight
        position={[lighting.dir2X, lighting.dir2Y, lighting.dir2Z]}
        intensity={lighting.dir2Intensity}
      />
      <pointLight
        position={[lighting.pointX, lighting.pointY, lighting.pointZ]}
        intensity={lighting.pointIntensity}
      />
      <spotLight
        position={[0, lighting.spotY, 0]}
        angle={lighting.spotAngle}
        penumbra={lighting.spotPenumbra}
        intensity={lighting.spotIntensity}
      />
      <Cube />
    </>
  );
}

export function RotatingCube() {
  const camera = useControls("Camera", {
    positionX: { value: 4, min: -10, max: 10, step: 0.1 },
    positionY: { value: 3, min: -10, max: 10, step: 0.1 },
    positionZ: { value: 7, min: -10, max: 10, step: 0.1 },
    fov: { value: 25, min: 10, max: 100, step: 1 },
  });

  return (
    <div className="h-48 w-48">
      <Canvas
        camera={{
          position: [camera.positionX, camera.positionY, camera.positionZ],
          fov: camera.fov,
        }}
        className="rounded-lg"
      >
        <Scene />
      </Canvas>
    </div>
  );
}
