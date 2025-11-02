import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, MeshPortalMaterial, Environment } from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";

// Available geometries for randomization
type GeometryType =
  | "torus"
  | "torusKnot"
  | "box"
  | "octahedron"
  | "icosahedron"
  | "dodecahedron";

const GEOMETRIES: GeometryType[] = [
  "torus",
  "torusKnot",
  "box",
  "octahedron",
  "icosahedron",
  "dodecahedron",
];

function getRandomGeometry(): GeometryType {
  return GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)];
}

function renderGeometry(type: GeometryType) {
  switch (type) {
    case "torus":
      return <torusGeometry args={[0.65, 0.3, 64]} />;
    case "torusKnot":
      return <torusKnotGeometry args={[0.55, 0.2, 128, 32]} />;
    case "box":
      return <boxGeometry args={[1.15, 1.15, 1.15]} />;
    case "octahedron":
      return <octahedronGeometry />;
    case "icosahedron":
      return <icosahedronGeometry />;
    case "dodecahedron":
      return <dodecahedronGeometry />;
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

  // State to track geometry for each face
  const [faceGeometries, setFaceGeometries] = useState<
    Record<string, GeometryType>
  >({
    front: getRandomGeometry(),
    back: getRandomGeometry(),
    right: getRandomGeometry(),
    left: getRandomGeometry(),
    top: getRandomGeometry(),
    bottom: getRandomGeometry(),
  });

  // Convert degrees to radians for initial rotation
  const initialRotationRadX = THREE.MathUtils.degToRad(initialRotationX);
  const initialRotationRadY = THREE.MathUtils.degToRad(initialRotationY);
  const initialRotationRadZ = THREE.MathUtils.degToRad(initialRotationZ);

  // Track previous rotation to detect when faces become invisible
  const prevRotationRef = useRef<THREE.Euler>(
    new THREE.Euler(
      initialRotationRadX,
      initialRotationRadY,
      initialRotationRadZ,
    ),
  );

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

      rotationState.rotationCount++;
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
      rotationState.currentRotation.copy(target);
      rotationState.isRotating = false;
      rotationState.pauseTimer = rotationState.pauseDuration; // Pause before next rotation

      // Randomize geometries for faces that are now not visible
      // When rotated 180 degrees on Y axis, front becomes back and vice versa
      // Left/right and top/bottom swap as well
      const rotationDiff = Math.abs(target.y - prevRotationRef.current.y);
      if (rotationDiff > Math.PI / 4) {
        // Only randomize if there's been significant rotation
        setFaceGeometries((prev) => ({
          front: getRandomGeometry(),
          back: getRandomGeometry(),
          right: getRandomGeometry(),
          left: getRandomGeometry(),
          top: getRandomGeometry(),
          bottom: getRandomGeometry(),
        }));
        prevRotationRef.current.copy(target);
      }
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
      >
        {renderGeometry(faceGeometries.front)}
      </Side>

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
      >
        {renderGeometry(faceGeometries.back)}
      </Side>

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
      >
        {renderGeometry(faceGeometries.right)}
      </Side>

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
      >
        {renderGeometry(faceGeometries.left)}
      </Side>

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
      >
        {renderGeometry(faceGeometries.top)}
      </Side>

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
      >
        {renderGeometry(faceGeometries.bottom)}
      </Side>
    </group>
  );
}

function Side({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  bg = "#f0f0f0",
  children,
  worldUnits = false,
  lookDirection = [0, 0, -1],
  faceWidth,
  faceHeight,
  roomDepth,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  bg?: string;
  children: React.ReactNode;
  worldUnits?: boolean;
  lookDirection?: [number, number, number];
  faceWidth: number;
  faceHeight: number;
  roomDepth: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const portalGroup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta;
      mesh.current.rotation.y += delta;
    }
  });

  return (
    <mesh position={position} rotation={rotation} renderOrder={0}>
      <planeGeometry args={[faceWidth * 1.001, faceHeight * 1.001]} />
      <MeshPortalMaterial worldUnits={worldUnits} blur={0} resolution={512}>
        {/** Everything in here is inside the portal and isolated from the canvas */}
        <ambientLight intensity={0.5} />
        <Environment preset="city" />

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
            {children}
            <meshLambertMaterial color={bg} />
          </mesh>
        </group>
      </MeshPortalMaterial>
    </mesh>
  );
}
