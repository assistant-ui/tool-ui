"use client";

import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type Axis = "x" | "y" | "z";
type ShapeKey = "sphere" | "icosahedron" | "torus" | "torusKnot" | "octahedron";
type MorphMode = "incoming" | "outgoing";

type TransitionState = {
  active: boolean;
  axis: Axis;
  start: number;
  end: number;
  progress: number;
};

const SHAPE_SEQUENCE: ShapeKey[] = [
  "torusKnot",
  "icosahedron",
  "sphere",
  "octahedron",
];

const MASK_DIRECTIONS: Record<Axis, THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

function renderShapeGeometry(shape: ShapeKey, size: number) {
  switch (shape) {
    case "sphere":
      return <sphereGeometry args={[size * 0.45, 48, 32]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[size * 0.42, 1]} />;
    case "torus":
      return <torusGeometry args={[size * 0.3, size * 0.1, 48, 64]} />;
    case "torusKnot":
      return <torusKnotGeometry args={[size * 0.28, size * 0.08, 128, 16]} />;
    case "octahedron":
    default:
      return <octahedronGeometry args={[size * 0.4, 0]} />;
  }
}

function createMorphMaterial(initialMode: MorphMode) {
  const material = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    emissive: new THREE.Color("#56ccf2"),
    emissiveIntensity: 0.7,
    roughness: 0.3,
    metalness: 0.2,
    clearcoat: 0.5,
    clearcoatRoughness: 0.15,
  });

  material.transparent = true;
  material.side = THREE.DoubleSide;
  material.depthTest = false;
  material.depthWrite = false;

  material.onBeforeCompile = (shader) => {
    const uniforms = {
      maskProgress: { value: initialMode === "incoming" ? 0 : 1 },
      maskDirection: { value: MASK_DIRECTIONS.y.clone() },
      maskSoftness: { value: 0.12 },
      maskExtent: { value: 1 },
      maskInvert: { value: initialMode === "outgoing" ? 1 : 0 },
    };

    shader.uniforms.maskProgress = uniforms.maskProgress;
    shader.uniforms.maskDirection = uniforms.maskDirection;
    shader.uniforms.maskSoftness = uniforms.maskSoftness;
    shader.uniforms.maskExtent = uniforms.maskExtent;
    shader.uniforms.maskInvert = uniforms.maskInvert;

    shader.vertexShader =
      `varying vec3 vLocalPosition;\n` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>\n  vLocalPosition = transformed;`,
    );

    shader.fragmentShader =
      `uniform float maskProgress;\n` +
      `uniform vec3 maskDirection;\n` +
      `uniform float maskSoftness;\n` +
      `uniform float maskExtent;\n` +
      `uniform float maskInvert;\n` +
      `varying vec3 vLocalPosition;\n` +
      shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `float axisPos = dot(vLocalPosition, maskDirection) / maskExtent;\n` +
        `float edge = maskProgress * 2.0 - 1.0;\n` +
        `float grad = smoothstep(edge - maskSoftness, edge + maskSoftness, axisPos);\n` +
        `float visibility = (maskInvert > 0.5) ? (1.0 - grad) : grad;\n` +
        `visibility = clamp(visibility, 0.0, 1.0);\n` +
        `if (visibility <= 0.0) discard;\n` +
        `gl_FragColor.rgb *= visibility;\n` +
        `gl_FragColor.a *= visibility;\n` +
        "#include <dithering_fragment>",
    );

    material.userData.uniforms = uniforms;
  };

  return material;
}

type TransitioningShapeProps = {
  cubeSize: number;
  currentShape: ShapeKey;
  nextShape: ShapeKey;
  transitionRef: MutableRefObject<TransitionState>;
};

function TransitioningShape({
  cubeSize,
  currentShape,
  nextShape,
  transitionRef,
}: TransitioningShapeProps) {
  const outgoingMaterialRef = useRef(createMorphMaterial("outgoing"));
  const incomingMaterialRef = useRef(createMorphMaterial("incoming"));

  const outgoingMeshRef = useRef<THREE.Mesh>(null);
  const incomingMeshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const outgoingMaterial = outgoingMaterialRef.current;
    const incomingMaterial = incomingMaterialRef.current;
    return () => {
      outgoingMaterial.dispose();
      incomingMaterial.dispose();
    };
  }, []);

  useEffect(() => {
    if (incomingMeshRef.current) {
      incomingMeshRef.current.visible = false;
    }
  }, []);

  const innerSize = cubeSize * 0.7;

  useFrame(() => {
    const transition = transitionRef.current;
    const axisDirection = MASK_DIRECTIONS[transition.axis];
    const extent = cubeSize * 0.5;

    const outgoingUniforms =
      (outgoingMaterialRef.current.userData.uniforms as {
        maskProgress?: { value: number };
        maskDirection?: { value: THREE.Vector3 };
        maskSoftness?: { value: number };
        maskExtent?: { value: number };
      }) || {};

    const incomingUniforms =
      (incomingMaterialRef.current.userData.uniforms as {
        maskProgress?: { value: number };
        maskDirection?: { value: THREE.Vector3 };
        maskSoftness?: { value: number };
        maskExtent?: { value: number };
      }) || {};

    const progress = transition.active ? transition.progress : 0;
    const maskedProgress = 1 - progress;

    // Intentionally mutating Three.js material uniforms for animation
    if (outgoingUniforms.maskDirection) {
      outgoingUniforms.maskDirection.value.copy(axisDirection);
    }
    if (outgoingUniforms.maskExtent) {
       
      outgoingUniforms.maskExtent.value = extent;
    }
    if (outgoingUniforms.maskSoftness) {
      outgoingUniforms.maskSoftness.value = 0.18;
    }
    if (outgoingUniforms.maskProgress) {
      outgoingUniforms.maskProgress.value = maskedProgress;
    }

    if (incomingUniforms.maskDirection) {
      incomingUniforms.maskDirection.value.copy(axisDirection);
    }
    if (incomingUniforms.maskExtent) {
       
      incomingUniforms.maskExtent.value = extent;
    }
    if (incomingUniforms.maskSoftness) {
      incomingUniforms.maskSoftness.value = 0.18;
    }
    if (incomingUniforms.maskProgress) {
      incomingUniforms.maskProgress.value = maskedProgress;
    }

    if (incomingMeshRef.current) {
      incomingMeshRef.current.visible = transition.active;
    }
  });

  return (
    <group>
      <mesh
        ref={outgoingMeshRef}
        material={outgoingMaterialRef.current}
        castShadow
        receiveShadow
      >
        {renderShapeGeometry(currentShape, innerSize)}
      </mesh>
      <mesh
        ref={incomingMeshRef}
        material={incomingMaterialRef.current}
        castShadow
        receiveShadow
      >
        {renderShapeGeometry(nextShape, innerSize)}
      </mesh>
    </group>
  );
}

function Cube() {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotationRef = useRef({ x: 0, y: 0, z: 0 });
  const transitionRef = useRef<TransitionState>({
    active: false,
    axis: "y",
    start: 0,
    end: 0,
    progress: 0,
  });
  const indicesRef = useRef({ current: 0, next: 1 });

  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [nextShapeIndex, setNextShapeIndex] = useState(1);

  const cubeMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#24c1b8",
        roughness: 0.4,
        metalness: 0.1,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      }),
    [],
  );

  useEffect(() => () => cubeMaterial.dispose(), [cubeMaterial]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!groupRef.current) return;
      if (transitionRef.current.active) return;

      const axes: Axis[] = ["x", "y", "z"];
      const axis = axes[Math.floor(Math.random() * axes.length)];
      const increment = Math.random() > 0.5 ? Math.PI / 2 : Math.PI;

      transitionRef.current = {
        active: true,
        axis,
        start: groupRef.current.rotation[axis],
        end: groupRef.current.rotation[axis] + increment,
        progress: 0,
      };

      const updatedTarget = { ...targetRotationRef.current };
      updatedTarget[axis] = transitionRef.current.end;
      targetRotationRef.current = updatedTarget;

      indicesRef.current.next =
        (indicesRef.current.current + 1) % SHAPE_SEQUENCE.length;
      setNextShapeIndex(indicesRef.current.next);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    const group = groupRef.current;
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      targetRotationRef.current.x,
      0.12,
    );
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      targetRotationRef.current.y,
      0.12,
    );
    group.rotation.z = THREE.MathUtils.lerp(
      group.rotation.z,
      targetRotationRef.current.z,
      0.12,
    );

    const transition = transitionRef.current;
    if (transition.active) {
      const currentValue = group.rotation[transition.axis];
      const totalSpan = transition.end - transition.start;
      const rawProgress =
        totalSpan !== 0 ? (currentValue - transition.start) / totalSpan : 1;
      transition.progress = THREE.MathUtils.clamp(rawProgress, 0, 1);

      if (transition.progress >= 0.99) {
        transition.active = false;
        transition.progress = 1;

        indicesRef.current.current = indicesRef.current.next;
        setCurrentShapeIndex(indicesRef.current.current);
        indicesRef.current.next =
          (indicesRef.current.current + 1) % SHAPE_SEQUENCE.length;
        setNextShapeIndex(indicesRef.current.next);
      }
    } else {
      transition.progress = 0;
    }
  });

  return (
    <group ref={groupRef}>
      <RoundedBox
        args={[2.4, 2.4, 2.4]}
        radius={0.35}
        smoothness={8}
        material={cubeMaterial}
      />
      <TransitioningShape
        cubeSize={2.4}
        currentShape={SHAPE_SEQUENCE[currentShapeIndex]}
        nextShape={SHAPE_SEQUENCE[nextShapeIndex]}
        transitionRef={transitionRef}
      />
    </group>
  );
}

export function RotatingCube() {
  return (
    <div className="h-64 w-64">
      <Canvas
        shadows
        gl={{ localClippingEnabled: true }}
        camera={{ position: [4, 3, 6], fov: 35 }}
        className="rounded-xl"
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[6, 6, 6]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, -3, -5]} intensity={0.6} />
        <Cube />
      </Canvas>
    </div>
  );
}
