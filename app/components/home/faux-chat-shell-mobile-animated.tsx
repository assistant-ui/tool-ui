"use client";

import { motion } from "motion/react";
import { FauxChatShellMobile } from "./faux-chat-shell-mobile";
import { generateNoiseDataUri } from "./noise-texture";

function generateSineEasedGradient(
  angle: number,
  centerPosition: number,
  peakOpacity: number,
  spreadWidth: number,
  steps: number = 128
): string {
  const stops: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const position = centerPosition - spreadWidth / 2 + spreadWidth * t;

    const sineValue = Math.sin(t * Math.PI);
    const eased = sineValue * sineValue;
    const opacity = peakOpacity * eased;

    stops.push(`rgba(255, 255, 255, ${opacity.toFixed(4)}) ${position.toFixed(1)}%`);
  }

  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}

export function FauxChatShellMobileAnimated() {
  // Hardcoded animation values - adjusted for portrait phone
  const initial = {
    opacity: 0,
    rotateX: 20,
    rotateY: 37,
    rotateZ: -13,
    x: 429,
    y: -298,
    scale: 2,
  };

  const resting = {
    opacity: 1,
    rotateX: 37,
    rotateY: 26,
    rotateZ: -18,
    x: -35,
    y: -60,
    scale: 1.05,
  };

  // Perspective and transform origin
  const perspective = 3700;
  const perspectiveOriginX = 100;
  const perspectiveOriginY = 29;
  const originX = 70;
  const originY = 64;
  const translateZInitial = 96;
  const translateZResting = 96;

  // Lighting parameters
  const lightAngle = 140;
  const lightPosition = 82;
  const lightSpread = 29;
  const lightOpacity = 0.07;

  // Calculate light position based on surface normal (simulates static directional light)
  function calculateLightPosition(rotateX: number, rotateY: number) {
    const baseY = lightPosition;
    const highlightY = baseY - (rotateX * 0.8) - (rotateY * 0.3);
    return highlightY;
  }

  // Calculate highlight position for resting state
  const restingLightPos = calculateLightPosition(resting.rotateX, resting.rotateY);

  // Generate gradient centered at calculated position
  const restingLightGradient = generateSineEasedGradient(
    lightAngle,
    restingLightPos,
    lightOpacity,
    lightSpread,
    32
  );

  // Animation config
  const transition = {
    type: "spring" as const,
    duration: 5,
    bounce: 0.2,
  };

  return (
    <div
      className="relative h-full w-full flex items-center justify-center"
      style={{
        perspective: `${perspective}px`,
        perspectiveOrigin: `${perspectiveOriginX}% ${perspectiveOriginY}%`,
      }}
    >
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-[2.5rem]"
        initial={{ ...initial, translateZ: translateZInitial }}
        animate={{ ...resting, translateZ: translateZResting }}
        transition={transition}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: `${originX}% ${originY}%`,
        }}
      >
        <FauxChatShellMobile />

        {/* Lighting overlay - fades in from 0 to full opacity */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition}
          style={{
            backgroundImage: `url("${generateNoiseDataUri(64, 0.015)}"), ${restingLightGradient}`,
            backgroundBlendMode: 'overlay, normal',
          }}
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}
