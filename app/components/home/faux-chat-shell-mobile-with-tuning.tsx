"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { useControls, folder, button } from "leva";
import { FauxChatShellMobile } from "./faux-chat-shell-mobile";
import { generateSineEasedGradient } from "./faux-chat-shell";

type InitialTransformValues = {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  scale: number;
};

type RestingTransformValues = InitialTransformValues & {
  opacity: number;
};

type AllValues = {
  initial: InitialTransformValues;
  resting: RestingTransformValues & {
    perspective: number;
    perspectiveOriginX: number;
    perspectiveOriginY: number;
    originX: number;
    originY: number;
    lightAngle: number;
    lightPosition: number;
    lightSpread: number;
    lightOpacity: number;
  };
};

export function FauxChatShellMobileWithTuning() {
  const [previewState, setPreviewState] = useState<"initial" | "resting">("resting");
  const [animationKey, setAnimationKey] = useState(0);
  const valuesRef = useRef<AllValues | null>(null);

  // Animation controls
  const { duration, easing } = useControls("Animation", {
    duration: { value: 5, min: 0.1, max: 10, step: 0.1, label: "Duration (s)" },
    easing: {
      value: "spring",
      options: ["easeOut", "easeInOut", "spring", "linear"],
      label: "Easing",
    },
  });

  // Initial state controls
  const initial = useControls("Initial State", {
    Actions: folder({
      "Preview Initial": button(() => setPreviewState("initial")),
      "Play Animation": button(() => {
        setPreviewState("initial");
        setTimeout(() => {
          setAnimationKey((k) => k + 1);
          setPreviewState("resting");
        }, 50);
      }),
    }),
    Transform: folder({
      rotateX: { value: 20, min: -90, max: 90, step: 1, label: "Rotate X (deg)" },
      rotateY: { value: 37, min: -90, max: 90, step: 1, label: "Rotate Y (deg)" },
      rotateZ: { value: -13, min: -90, max: 90, step: 1, label: "Rotate Z (deg)" },
      translateX: { value: 429, min: -1000, max: 1000, step: 1, label: "Translate X (px)" },
      translateY: { value: -298, min: -1000, max: 1000, step: 1, label: "Translate Y (px)" },
      translateZ: { value: 20, min: -1000, max: 1000, step: 1, label: "Translate Z (px)" },
      scale: { value: 2, min: 0.5, max: 2, step: 0.05, label: "Scale" },
    }),
  });

  // Resting state controls
  const resting = useControls("Resting State", {
    Actions: folder({
      "Preview Resting": button(() => setPreviewState("resting")),
      "Copy for LLM": button(() => {
        const v = valuesRef.current;
        if (!v) return;

        const formatted = `
## Animation Values for Faux Browser Shell

### Initial State (animation start, opacity always 0)
\`\`\`tsx
{
  opacity: 0,
  rotateX: ${v.initial.rotateX},
  rotateY: ${v.initial.rotateY},
  rotateZ: ${v.initial.rotateZ},
  x: ${v.initial.translateX},
  y: ${v.initial.translateY},
  scale: ${v.initial.scale},
}
\`\`\`

### Resting State (animation end)
\`\`\`tsx
{
  opacity: ${v.resting.opacity},
  rotateX: ${v.resting.rotateX},
  rotateY: ${v.resting.rotateY},
  rotateZ: ${v.resting.rotateZ},
  x: ${v.resting.translateX},
  y: ${v.resting.translateY},
  scale: ${v.resting.scale},
}
\`\`\`

### Container Style
\`\`\`tsx
{
  perspective: "${v.resting.perspective}px",
  perspectiveOrigin: "${v.resting.perspectiveOriginX}% ${v.resting.perspectiveOriginY}%",
}
\`\`\`

### Transform Style
\`\`\`tsx
{
  transformStyle: "preserve-3d",
  transformOrigin: "${v.resting.originX}% ${v.resting.originY}%",
  translateZ: ${v.resting.translateZ},
}
\`\`\`

### Light Reflection (Static Environmental)
- Angle: ${v.resting.lightAngle}deg
- Center Position: ${v.resting.lightPosition}%
- Spread: ${v.resting.lightSpread}%
- Peak Opacity: ${v.resting.lightOpacity}
`;
        navigator.clipboard.writeText(formatted);
        console.log("Copied animation values to clipboard!");
      }),
    }),
    Transform: folder({
      opacity: { value: 1, min: 0, max: 1, step: 0.05, label: "Opacity" },
      rotateX: { value: 47, min: -90, max: 90, step: 1, label: "Rotate X (deg)" },
      rotateY: { value: 21, min: -90, max: 90, step: 1, label: "Rotate Y (deg)" },
      rotateZ: { value: -19, min: -90, max: 90, step: 1, label: "Rotate Z (deg)" },
      translateX: { value: -56, min: -1000, max: 1000, step: 1, label: "Translate X (px)" },
      translateY: { value: -55, min: -1000, max: 1000, step: 1, label: "Translate Y (px)" },
      translateZ: { value: 40, min: -1000, max: 1000, step: 1, label: "Translate Z (px)" },
      scale: { value: 0.95, min: 0.5, max: 2, step: 0.05, label: "Scale" },
    }),
    Perspective: folder({
      perspective: { value: 1800, min: 500, max: 5000, step: 100, label: "Perspective (px)" },
      perspectiveOriginX: { value: 64, min: 0, max: 100, step: 1, label: "Origin X (%)" },
      perspectiveOriginY: { value: 0, min: 0, max: 100, step: 1, label: "Origin Y (%)" },
    }),
    "Transform Origin": folder({
      originX: { value: 80, min: 0, max: 100, step: 1, label: "Origin X (%)" },
      originY: { value: 53, min: 0, max: 100, step: 1, label: "Origin Y (%)" },
    }),
    "Light Reflection (Static)": folder({
      lightAngle: { value: 137, min: 0, max: 360, step: 1, label: "Angle (deg)" },
      lightPosition: { value: 82, min: 0, max: 100, step: 1, label: "Center Position (%)" },
      lightSpread: { value: 29, min: 10, max: 100, step: 1, label: "Spread (%)" },
      lightOpacity: { value: 0.07, min: 0, max: 0.5, step: 0.01, label: "Peak Opacity" },
    }),
  });

  // Update ref for copy button
  valuesRef.current = { initial, resting };

  // Define both animation targets
  // When previewing initial state, show at full opacity so user can see the position
  // When playing animation (via key change), starts at opacity 0 and fades in
  const initialTarget = {
    opacity: 1,
    rotateX: initial.rotateX,
    rotateY: initial.rotateY,
    rotateZ: initial.rotateZ,
    x: initial.translateX,
    y: initial.translateY,
    scale: initial.scale,
  };

  // The mount state (used by motion's initial prop) starts at 0 opacity for fade-in
  const mountState = {
    opacity: 0,
    rotateX: initial.rotateX,
    rotateY: initial.rotateY,
    rotateZ: initial.rotateZ,
    x: initial.translateX,
    y: initial.translateY,
    scale: initial.scale,
  };

  const restingTarget = {
    opacity: resting.opacity,
    rotateX: resting.rotateX,
    rotateY: resting.rotateY,
    rotateZ: resting.rotateZ,
    x: resting.translateX,
    y: resting.translateY,
    scale: resting.scale,
  };

  // Animate to whichever state we're currently previewing
  const animateTarget = previewState === "initial" ? initialTarget : restingTarget;
  const currentTranslateZ = previewState === "initial" ? initial.translateZ : resting.translateZ;

  // Get transition config based on easing selection
  const getTransition = () => {
    if (easing === "spring") {
      return { type: "spring" as const, duration, bounce: 0.2 };
    }
    const easingMap = {
      easeOut: [0.22, 1, 0.36, 1] as const,
      easeInOut: [0.42, 0, 0.58, 1] as const,
      linear: [0, 0, 1, 1] as const,
    };
    return {
      duration,
      ease: easingMap[easing as keyof typeof easingMap] || easingMap.easeOut,
    };
  };

  // Calculate light position based on surface normal (simulates static directional light)
  // As the shell rotates, the highlight moves across its surface
  function calculateLightPosition(rotateX: number, rotateY: number, _rotateZ: number) {
    // Base position from controls
    const baseX = resting.lightPosition;
    const baseY = resting.lightPosition;

    // Light direction: from top-left, slightly toward viewer
    // As surface rotates toward light, highlight moves toward center
    // As surface rotates away, highlight moves toward edges
    const highlightX = baseX + (rotateY * 0.8) - (rotateX * 0.3);
    const highlightY = baseY - (rotateX * 0.8) - (rotateY * 0.3);

    return { x: highlightX, y: highlightY };
  }

  // Calculate highlight position for resting state
  const restingLightPos = calculateLightPosition(
    resting.rotateX,
    resting.rotateY,
    resting.rotateZ
  );

  // Generate gradient centered at calculated position
  const restingLightGradient = generateSineEasedGradient(
    resting.lightAngle,
    restingLightPos.y,
    resting.lightOpacity,
    resting.lightSpread,
    32
  );

  return (
    <div
      className="relative h-full w-full"
      style={{
        perspective: `${resting.perspective}px`,
        perspectiveOrigin: `${resting.perspectiveOriginX}% ${resting.perspectiveOriginY}%`,
      }}
    >
      {/* Shell with surface-normal lighting */}
      <motion.div
        key={animationKey}
        className="relative h-full w-full overflow-hidden rounded-2xl"
        initial={mountState}
        animate={animateTarget}
        transition={getTransition()}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: `${resting.originX}% ${resting.originY}%`,
          translateZ: currentTranslateZ,
        }}
      >
        <FauxChatShellMobile disableLightOverlay />

        {/* Lighting overlay - fades in from 0 to full opacity */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={getTransition()}
          style={{
            background: restingLightGradient,
          }}
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}
