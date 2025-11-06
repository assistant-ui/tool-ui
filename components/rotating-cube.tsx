"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useControls, folder } from "leva";
import * as THREE from "three";
import {
  BarChart3,
  LineChart,
  PieChart,
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  Table,
  Smile,
  Laugh,
  SmilePlus,
  Images,
  Image as ImageIcon,
  Network,
  Workflow,
  GitBranch,
  type LucideIcon,
} from "lucide-react";

// Color Palettes
const COLOR_PALETTES = {
  original: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#95e1d3", "#c44569"],
  pastel: ["#ffc8dd", "#bde0fe", "#a2d2ff", "#cdb4db", "#ffafcc", "#ffd6a5"],
  neon: ["#ff006e", "#fb5607", "#ffbe0b", "#8338ec", "#3a86ff", "#06ffa5"],
  jewel: ["#d62828", "#003049", "#f77f00", "#06d6a0", "#118ab2", "#ef476f"],
  earth: ["#9c6644", "#52796f", "#84a98c", "#cad2c5", "#d4a373", "#606c38"],
  ocean: ["#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8", "#48cae4"],
  sunset: ["#ff006e", "#fb5607", "#ffbe0b", "#ff8500", "#d62828", "#8338ec"],
  monochrome: [
    "#ffffff",
    "#d3d3d3",
    "#a8a8a8",
    "#808080",
    "#505050",
    "#202020",
  ],
};

// Helper: Create icon texture from Lucide icon using SVG
function createIconTexture(
  Icon: LucideIcon,
  color: string = "#ffffff",
  bgColor: string = "transparent",
  size: number = 512,
): THREE.Texture {
  const iconSize = size * 0.7;
  const padding = (size - iconSize) / 2;

  // Get SVG path for the icon
  const svgPath = getIconPaths(Icon);

  // Create SVG string with proper scaling
  const svgString = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${bgColor}"/>
    <g transform="translate(${padding}, ${padding}) scale(${iconSize / 24})">
      <svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${svgPath}
      </svg>
    </g>
  </svg>`;

  // Convert SVG to data URL
  const svgDataUrl =
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svgString)));

  // Create texture from data URL
  const texture = new THREE.TextureLoader().load(svgDataUrl);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

// Helper to get icon SVG paths (simplified)
function getIconPaths(Icon: LucideIcon): string {
  // This is a mapping of icon components to their SVG paths
  // In practice, we'd need to extract this from the lucide-react package
  const iconPaths: Record<string, string> = {
    BarChart3:
      '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    LineChart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    PieChart:
      '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    Cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    CloudRain:
      '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M16 14v2"/><path d="M8 14v2"/><path d="M12 16v2"/>',
    Sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    CloudSun:
      '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
    Table:
      '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    Smile:
      '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    Laugh:
      '<circle cx="12" cy="12" r="10"/><path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    SmilePlus:
      '<path d="M22 11v1a10 10 0 1 1-9-10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/><path d="M16 5h6"/><path d="M19 2v6"/>',
    Images:
      '<path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><circle cx="12" cy="8" r="2"/><rect width="16" height="16" x="6" y="2" rx="2"/>',
    ImageIcon:
      '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    Network:
      '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    Workflow:
      '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    GitBranch:
      '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  };

  return iconPaths[Icon.name] || "";
}

// Helper: Create gradient texture
function createGradientTexture(
  type: "linear" | "radial",
  colors: string[],
  direction: number = 0,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  let gradient;
  if (type === "linear") {
    const angle = (direction * Math.PI) / 180;
    const x1 = 128 + Math.cos(angle) * 128;
    const y1 = 128 + Math.sin(angle) * 128;
    const x2 = 128 - Math.cos(angle) * 128;
    const y2 = 128 - Math.sin(angle) * 128;
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  } else {
    gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  }

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Helper: Create pattern texture
function createPatternTexture(
  pattern: "stripes" | "dots" | "grid" | "noise",
  color1: string,
  color2: string,
  scale: number,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = color2;

  const size = scale * 10;

  switch (pattern) {
    case "stripes":
      for (let i = 0; i < 256; i += size * 2) {
        ctx.fillRect(i, 0, size, 256);
      }
      break;
    case "dots":
      for (let x = 0; x < 256; x += size) {
        for (let y = 0; y < 256; y += size) {
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size / 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case "grid":
      for (let i = 0; i < 256; i += size) {
        ctx.fillRect(i, 0, 2, 256);
        ctx.fillRect(0, i, 256, 2);
      }
      break;
    case "noise":
      for (let i = 0; i < 256; i++) {
        for (let j = 0; j < 256; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i, j, 1, 1);
          }
        }
      }
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function Cube() {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotationRef = useRef({
    x: 0,
    y: 0,
    z: 0,
  });
  const rotationIndexRef = useRef(0);
  const timeRef = useRef(0);

  // Visual Style Selector (top-level control)
  const visualStyle = useControls("Visual Style", {
    style: {
      value: "Solid Colors",
      options: [
        "Solid Colors",
        "Gradient Faces",
        "Holographic",
        "Glass",
        "Patterns",
        "Wireframe",
        "Enhanced Glow",
        "Color Palette",
        "Animated Shader",
      ],
    },
  });

  // Leva Controls - Cube Geometry
  const cubeGeometry = useControls("Cube Geometry", {
    size: { value: 2, min: 0.5, max: 5, step: 0.1 },
    cornerRadius: { value: 0.22, min: 0, max: 0.5, step: 0.01 },
    smoothness: { value: 10, min: 1, max: 20, step: 1 },
  });

  // Style-specific controls
  const solidColorControls = useControls(
    "Solid Colors",
    {
      "Face Colors": folder({
        rightColor: { value: "#000000", label: "Right" },
        leftColor: { value: "#000000", label: "Left" },
        topColor: { value: "#000", label: "Top" },
        bottomColor: { value: "#000", label: "Bottom" },
        frontColor: { value: "#000", label: "Front" },
        backColor: { value: "#000", label: "Back" },
      }),
      "Material Properties": folder({
        metalness: { value: 0.3, min: 0, max: 1, step: 0.01 },
        roughness: { value: 0.2, min: 0, max: 1, step: 0.01 },
        clearcoat: { value: 0.5, min: 0, max: 1, step: 0.01 },
        clearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
      }),
    },
    { render: () => visualStyle.style === "Solid Colors" },
  );

  const gradientControls = useControls(
    "Gradient Settings",
    {
      gradientType: {
        value: "radial",
        options: ["linear", "radial"],
        label: "Type",
      },
      color1: { value: "#ff006e", label: "Color 1" },
      color2: { value: "#8338ec", label: "Color 2" },
      color3: { value: "#3a86ff", label: "Color 3" },
      direction: { value: 0, min: 0, max: 360, step: 1, label: "Direction" },
    },
    { render: () => visualStyle.style === "Gradient Faces" },
  );

  const holographicControls = useControls(
    "Holographic Settings",
    {
      iridescence: { value: 1, min: 0, max: 1, step: 0.01 },
      iridescenceIOR: {
        value: 1.3,
        min: 1,
        max: 2.333,
        step: 0.01,
        label: "IOR",
      },
      thickness: { value: 200, min: 0, max: 1000, step: 10 },
      baseColor: { value: "#ffffff" },
      metalness: { value: 0.1, min: 0, max: 1, step: 0.01 },
      roughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    },
    { render: () => visualStyle.style === "Holographic" },
  );

  const glassControls = useControls(
    "Glass Settings",
    {
      transmission: { value: 0.9, min: 0, max: 1, step: 0.01 },
      thickness: { value: 0.5, min: 0, max: 5, step: 0.1 },
      roughness: { value: 0.05, min: 0, max: 1, step: 0.01 },
      ior: { value: 1.5, min: 1, max: 2.333, step: 0.01, label: "IOR" },
      tintColor: { value: "#4ecdc4" },
      opacity: { value: 1, min: 0, max: 1, step: 0.01 },
    },
    { render: () => visualStyle.style === "Glass" },
  );

  const patternControls = useControls(
    "Pattern Settings",
    {
      patternType: {
        value: "stripes",
        options: ["stripes", "dots", "grid", "noise"],
        label: "Pattern",
      },
      color1: { value: "#ff006e", label: "Color 1" },
      color2: { value: "#ffbe0b", label: "Color 2" },
      scale: { value: 2, min: 0.5, max: 10, step: 0.5 },
      metalness: { value: 0.5, min: 0, max: 1, step: 0.01 },
      roughness: { value: 0.3, min: 0, max: 1, step: 0.01 },
    },
    { render: () => visualStyle.style === "Patterns" },
  );

  const wireframeControls = useControls(
    "Wireframe Settings",
    {
      wireframe: { value: true },
      edgeColor: { value: "#00ffff" },
      faceOpacity: { value: 0.2, min: 0, max: 1, step: 0.01 },
      glowIntensity: { value: 2, min: 0, max: 5, step: 0.1 },
      emissiveIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
    },
    { render: () => visualStyle.style === "Wireframe" },
  );

  const glowControls = useControls(
    "Glow Settings",
    {
      baseColor: { value: "#ff006e" },
      emissiveColor: { value: "#ff006e" },
      emissiveIntensity: { value: 2, min: 0, max: 5, step: 0.1 },
      pulse: { value: true, label: "Pulse Animation" },
      pulseSpeed: { value: 2, min: 0.1, max: 10, step: 0.1 },
    },
    { render: () => visualStyle.style === "Enhanced Glow" },
  );

  const paletteControls = useControls(
    "Palette Settings",
    {
      palette: {
        value: "neon",
        options: Object.keys(COLOR_PALETTES),
      },
      saturation: { value: 1, min: 0, max: 2, step: 0.1 },
      brightness: { value: 1, min: 0, max: 2, step: 0.1 },
      metalness: { value: 0.4, min: 0, max: 1, step: 0.01 },
      roughness: { value: 0.2, min: 0, max: 1, step: 0.01 },
    },
    { render: () => visualStyle.style === "Color Palette" },
  );

  const shaderControls = useControls(
    "Shader Settings",
    {
      speed: { value: 0.5, min: 0.1, max: 5, step: 0.1 },
      intensity: { value: 1, min: 0, max: 2, step: 0.1 },
      hueShift: { value: true, label: "Hue Shift" },
      wavePattern: { value: true, label: "Wave Pattern" },
    },
    { render: () => visualStyle.style === "Animated Shader" },
  );

  // Icon Controls
  const iconControls = useControls("Face Icons", {
    useIcons: { value: true, label: "Use Icons (vs Shapes)" },
    iconSize: {
      value: 0.6,
      min: 0.2,
      max: 1.5,
      step: 0.05,
      label: "Icon Size",
    },
    iconColor: { value: "#ffffff", label: "Icon Color" },
    iconBgOpacity: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.05,
      label: "BG Opacity",
    },
    "Icon Selection": folder({
      frontIcon: {
        value: "BarChart3",
        options: ["BarChart3", "LineChart", "PieChart"],
        label: "Front (Charts)",
      },
      backIcon: {
        value: "Cloud",
        options: ["Cloud", "CloudRain", "Sun", "CloudSun"],
        label: "Back (Weather)",
      },
      rightIcon: {
        value: "Table",
        options: ["Table"],
        label: "Right (Tables)",
      },
      leftIcon: {
        value: "Smile",
        options: ["Smile", "Laugh", "SmilePlus"],
        label: "Left (Smile)",
      },
      topIcon: {
        value: "Images",
        options: ["Images", "ImageIcon"],
        label: "Top (Gallery)",
      },
      bottomIcon: {
        value: "Network",
        options: ["Network", "Workflow", "GitBranch"],
        label: "Bottom (Diagram)",
      },
    }),
  });

  // Shape Material Controls (used when icons are disabled)
  const shapeMaterialControls = useControls(
    "Shape Material",
    {
      shapeColor: { value: "#ffffff", label: "Color" },
      shapeMetalness: { value: 0.4, min: 0, max: 1, step: 0.01 },
      shapeRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
      shapeClearcoat: { value: 0.8, min: 0, max: 1, step: 0.01 },
      shapeClearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
      emissiveIntensity: { value: 0.1, min: 0, max: 1, step: 0.01 },
    },
    { render: () => !iconControls.useIcons },
  );

  // Animation Controls
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

  // Build rotation increments
  const ROTATION_INCREMENTS = useMemo(() => {
    const increments: number[] = [];
    if (animation.use90Degrees) increments.push(Math.PI / 2);
    if (animation.use180Degrees) increments.push(Math.PI);
    if (increments.length === 0) increments.push(Math.PI / 2);
    return increments;
  }, [animation.use90Degrees, animation.use180Degrees]);

  const ROTATION_PATTERNS = useMemo(() => [
    { axis: "y" as const, label: "horizontal" },
    { axis: "x" as const, label: "vertical" },
    { axis: "z" as const, label: "roll" },
  ], []);

  // Update initial rotation
  useEffect(() => {
    targetRotationRef.current = {
      x: animation.initialX,
      y: animation.initialY,
      z: animation.initialZ,
    };
  }, [animation.initialX, animation.initialY, animation.initialZ]);

  // Rotation animation
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
  }, [animation.intervalMs, ROTATION_INCREMENTS, ROTATION_PATTERNS]);

  // Smooth rotation interpolation & animation time
  useFrame((_, delta) => {
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

    timeRef.current += delta;
  });

  // Generate materials based on selected style
  const materials = useMemo(() => {
    switch (visualStyle.style) {
      case "Solid Colors":
        return [
          solidColorControls.rightColor,
          solidColorControls.leftColor,
          solidColorControls.topColor,
          solidColorControls.bottomColor,
          solidColorControls.frontColor,
          solidColorControls.backColor,
        ].map(
          (color) =>
            new THREE.MeshPhysicalMaterial({
              color,
              metalness: solidColorControls.metalness,
              roughness: solidColorControls.roughness,
              clearcoat: solidColorControls.clearcoat,
              clearcoatRoughness: solidColorControls.clearcoatRoughness,
            }),
        );

      case "Gradient Faces":
        const gradColors = [
          gradientControls.color1,
          gradientControls.color2,
          gradientControls.color3,
        ];
        return Array(6)
          .fill(0)
          .map((_, i) => {
            const texture = createGradientTexture(
              gradientControls.gradientType as "linear" | "radial",
              gradColors,
              gradientControls.direction + i * 60,
            );
            return new THREE.MeshPhysicalMaterial({
              map: texture,
              metalness: 0.3,
              roughness: 0.2,
              clearcoat: 0.5,
            });
          });

      case "Holographic":
        return Array(6)
          .fill(0)
          .map(
            () =>
              new THREE.MeshPhysicalMaterial({
                color: holographicControls.baseColor,
                metalness: holographicControls.metalness,
                roughness: holographicControls.roughness,
                iridescence: holographicControls.iridescence,
                iridescenceIOR: holographicControls.iridescenceIOR,
                thickness: holographicControls.thickness,
                clearcoat: 1,
                clearcoatRoughness: 0,
              }),
          );

      case "Glass":
        return Array(6)
          .fill(0)
          .map(
            () =>
              new THREE.MeshPhysicalMaterial({
                color: glassControls.tintColor,
                metalness: 0,
                roughness: glassControls.roughness,
                transmission: glassControls.transmission,
                thickness: glassControls.thickness,
                ior: glassControls.ior,
                opacity: glassControls.opacity,
                transparent: true,
              }),
          );

      case "Patterns":
        return Array(6)
          .fill(0)
          .map(() => {
            const texture = createPatternTexture(
              patternControls.patternType as
                | "stripes"
                | "dots"
                | "grid"
                | "noise",
              patternControls.color1,
              patternControls.color2,
              patternControls.scale,
            );
            return new THREE.MeshPhysicalMaterial({
              map: texture,
              metalness: patternControls.metalness,
              roughness: patternControls.roughness,
              clearcoat: 0.5,
            });
          });

      case "Wireframe":
        return Array(6)
          .fill(0)
          .map(
            () =>
              new THREE.MeshPhysicalMaterial({
                color: wireframeControls.edgeColor,
                wireframe: wireframeControls.wireframe,
                opacity: wireframeControls.faceOpacity,
                transparent: true,
                emissive: wireframeControls.edgeColor,
                emissiveIntensity: wireframeControls.emissiveIntensity,
                metalness: 0.8,
                roughness: 0.2,
              }),
          );

      case "Enhanced Glow":
        return Array(6)
          .fill(0)
          .map(
            () =>
              new THREE.MeshPhysicalMaterial({
                color: glowControls.baseColor,
                emissive: glowControls.emissiveColor,
                emissiveIntensity: glowControls.emissiveIntensity,
                metalness: 0.2,
                roughness: 0.1,
              }),
          );

      case "Color Palette":
        const palette =
          COLOR_PALETTES[
            paletteControls.palette as keyof typeof COLOR_PALETTES
          ];
        return palette.map((color) => {
          const c = new THREE.Color(color);
          c.multiplyScalar(paletteControls.brightness);
          return new THREE.MeshPhysicalMaterial({
            color: c,
            metalness: paletteControls.metalness,
            roughness: paletteControls.roughness,
            clearcoat: 0.5,
          });
        });

      case "Animated Shader":
        return Array(6)
          .fill(0)
          .map((_, i) => {
            const hue = i / 6;
            const color = new THREE.Color().setHSL(
              hue,
              0.8,
              0.5 * shaderControls.intensity,
            );
            return new THREE.MeshPhysicalMaterial({
              color,
              emissive: color,
              emissiveIntensity: 0.5,
              metalness: 0.3,
              roughness: 0.2,
            });
          });

      default:
        return [];
    }
  }, [
    visualStyle.style,
    solidColorControls,
    gradientControls,
    holographicControls,
    glassControls,
    patternControls,
    wireframeControls,
    glowControls,
    paletteControls,
    shaderControls,
  ]);

  // Icon mapping helper
  const getIconComponent = (iconName: string): LucideIcon => {
    const allIcons = {
      BarChart3,
      LineChart,
      PieChart,
      Cloud,
      CloudRain,
      Sun,
      CloudSun,
      Table,
      Smile,
      Laugh,
      SmilePlus,
      Images,
      ImageIcon,
      Network,
      Workflow,
      GitBranch,
    };
    return allIcons[iconName as keyof typeof allIcons] || BarChart3;
  };

  // Create icon textures
  const iconTextures = useMemo(() => {
    if (!iconControls.useIcons) return null;

    const bgColor = `rgba(0,0,0,${iconControls.iconBgOpacity})`;

    return {
      front: createIconTexture(
        getIconComponent(iconControls.frontIcon),
        iconControls.iconColor,
        bgColor,
      ),
      back: createIconTexture(
        getIconComponent(iconControls.backIcon),
        iconControls.iconColor,
        bgColor,
      ),
      right: createIconTexture(
        getIconComponent(iconControls.rightIcon),
        iconControls.iconColor,
        bgColor,
      ),
      left: createIconTexture(
        getIconComponent(iconControls.leftIcon),
        iconControls.iconColor,
        bgColor,
      ),
      top: createIconTexture(
        getIconComponent(iconControls.topIcon),
        iconControls.iconColor,
        bgColor,
      ),
      bottom: createIconTexture(
        getIconComponent(iconControls.bottomIcon),
        iconControls.iconColor,
        bgColor,
      ),
    };
  }, [
    iconControls.useIcons,
    iconControls.frontIcon,
    iconControls.backIcon,
    iconControls.rightIcon,
    iconControls.leftIcon,
    iconControls.topIcon,
    iconControls.bottomIcon,
    iconControls.iconColor,
    iconControls.iconBgOpacity,
  ]);

  // Shape material (for non-icon mode)
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
  const iconSize = iconControls.iconSize;

  return (
    <group ref={groupRef}>
      <RoundedBox
        args={[cubeGeometry.size, cubeGeometry.size, cubeGeometry.size]}
        radius={cubeGeometry.cornerRadius}
        smoothness={cubeGeometry.smoothness}
        material={materials}
      />

      {/* Icons or decorative shapes on each face */}
      {iconControls.useIcons && iconTextures ? (
        <>
          {/* Front face - Charts icon */}
          <mesh position={[0, 0, shapeOffset]}>
            <planeGeometry args={[iconSize, iconSize]} />
            <meshBasicMaterial map={iconTextures.front} transparent />
          </mesh>

          {/* Back face - Weather icon */}
          <mesh position={[0, 0, -shapeOffset]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[iconSize, iconSize]} />
            <meshBasicMaterial map={iconTextures.back} transparent />
          </mesh>

          {/* Right face - Tables icon */}
          <mesh position={[shapeOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[iconSize, iconSize]} />
            <meshBasicMaterial map={iconTextures.right} transparent />
          </mesh>

          {/* Left face - Smiling Face icon */}
          <mesh position={[-shapeOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[iconSize, iconSize]} />
            <meshBasicMaterial map={iconTextures.left} transparent />
          </mesh>

          {/* Top face - Image Gallery icon */}
          <mesh position={[0, shapeOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[iconSize, iconSize]} />
            <meshBasicMaterial map={iconTextures.top} transparent />
          </mesh>

          {/* Bottom face - Diagram icon */}
          <mesh position={[0, -shapeOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[iconSize, iconSize]} />
            <meshBasicMaterial map={iconTextures.bottom} transparent />
          </mesh>
        </>
      ) : (
        <>
          {/* Original decorative shapes */}
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
        </>
      )}
    </group>
  );
}

function Scene() {
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
