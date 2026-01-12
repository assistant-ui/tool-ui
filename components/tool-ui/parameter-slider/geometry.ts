/**
 * Geometry utilities for parameter-slider handle rendering.
 *
 * This module provides:
 * - Hourglass clip-path generation for the morphing handle shape
 * - Signed distance calculations for text collision detection
 * - Gap calculation for determining handle-to-text proximity
 */

// ─────────────────────────────────────────────────────────────────────────────
// Hourglass Shape Configuration
// ─────────────────────────────────────────────────────────────────────────────

const HOURGLASS_MIN_WAIST = 4;
const HOURGLASS_CAP_SIZE = 8;

/**
 * Generates a CSS polygon clip-path that morphs between a pill shape and an hourglass.
 *
 * @param pinch - Amount of pinching (0 = pill, 1 = full hourglass)
 * @param waistYPercent - Vertical position of the waist (0-100, 50 = center)
 * @returns CSS polygon() string for use in clip-path
 */
export function generateHourglassClipPath(
  pinch: number,
  waistYPercent: number = 49,
): string {
  const capSize = HOURGLASS_CAP_SIZE;
  const waistWidth = 100 - pinch * (100 - HOURGLASS_MIN_WAIST);
  const waistHalf = waistWidth / 2;

  const getHalfWidth = (y: number): number => {
    if (pinch < 0.001) return 50;

    const edgeTop = capSize;
    const edgeBottom = 100 - capSize;
    const clampedY = Math.max(edgeTop, Math.min(edgeBottom, y));

    const edgeRange = edgeBottom - edgeTop;
    if (edgeRange < 0.001) return waistHalf;

    const normalizedY = (clampedY - edgeTop) / edgeRange;
    const normalizedWaist = Math.max(
      0.001,
      Math.min(0.999, (waistYPercent - edgeTop) / edgeRange),
    );

    let angle: number;
    if (normalizedY <= normalizedWaist) {
      angle = Math.PI * (1 - normalizedY / normalizedWaist);
    } else {
      angle = (Math.PI * (normalizedY - normalizedWaist)) / (1 - normalizedWaist);
    }

    const blend = (1 - Math.cos(angle)) / 2;
    const power = 1 + pinch * 1.0;
    const adjustedBlend = Math.pow(blend, power);
    return waistHalf + (50 - waistHalf) * adjustedBlend;
  };

  const points: [number, number][] = [];
  const capPoints = 12;
  const edgePoints = 24;

  // Top cap: semicircle
  for (let i = 0; i <= capPoints; i++) {
    const t = i / capPoints;
    const angle = Math.PI * (1 - t);
    const x = 50 + 50 * Math.cos(angle);
    const y = capSize - capSize * Math.sin(angle);
    points.push([x, y]);
  }

  // Right edge
  for (let i = 1; i < edgePoints; i++) {
    const t = i / edgePoints;
    const y = capSize + t * (100 - 2 * capSize);
    const halfW = getHalfWidth(y);
    points.push([50 + halfW, y]);
  }

  // Bottom cap: semicircle
  for (let i = 0; i <= capPoints; i++) {
    const t = i / capPoints;
    const angle = -Math.PI * t;
    const x = 50 + 50 * Math.cos(angle);
    const y = 100 - capSize - capSize * Math.sin(angle);
    points.push([x, y]);
  }

  // Left edge
  for (let i = 1; i < edgePoints; i++) {
    const t = i / edgePoints;
    const y = 100 - capSize - t * (100 - 2 * capSize);
    const halfW = getHalfWidth(y);
    points.push([50 - halfW, y]);
  }

  return `polygon(${points.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(", ")})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Text Collision Detection
// ─────────────────────────────────────────────────────────────────────────────

export interface TextRect {
  left: number;
  right: number;
  height: number;
  centerY: number;
}

export interface HitboxConfig {
  paddingX: number;
  paddingXOuter: number;
  paddingY: number;
  marginX: number;
  marginXOuter: number;
  marginY: number;
  outerEdgeRadiusFactor: number;
}

/**
 * Computes signed distance from a point to a rounded rectangle.
 * Negative values indicate the point is inside the rectangle.
 */
export function signedDistanceToRoundedRect(
  px: number,
  py: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  radiusLeft: number,
  radiusRight: number,
): number {
  const innerLeft = left + radiusLeft;
  const innerRight = right - radiusRight;
  const innerTop = top + Math.max(radiusLeft, radiusRight);
  const innerBottom = bottom - Math.max(radiusLeft, radiusRight);

  const inLeftCorner = px < innerLeft;
  const inRightCorner = px > innerRight;
  const inCornerY = py < innerTop || py > innerBottom;

  if ((inLeftCorner || inRightCorner) && inCornerY) {
    const radius = inLeftCorner ? radiusLeft : radiusRight;
    const cornerX = inLeftCorner ? innerLeft : innerRight;
    const cornerY = py < innerTop ? top + radius : bottom - radius;
    const distToCornerCenter = Math.hypot(px - cornerX, py - cornerY);
    return distToCornerCenter - radius;
  }

  const dx = Math.max(left - px, px - right, 0);
  const dy = Math.max(top - py, py - bottom, 0);

  if (dx === 0 && dy === 0) {
    return -Math.min(px - left, right - px, py - top, bottom - py);
  }

  return Math.max(dx, dy);
}

/**
 * Calculates the gap between the slider thumb and a text element's hitbox.
 * Returns a value from 0 (outside detection zone) to maxGap (overlapping inner bounds).
 */
export function calculateGap(
  thumbCenterX: number,
  textRect: TextRect,
  isLeftAligned: boolean,
  config: HitboxConfig,
): number {
  const { left, right, height, centerY } = textRect;
  const {
    paddingX,
    paddingXOuter,
    paddingY,
    marginX,
    marginXOuter,
    marginY,
    outerEdgeRadiusFactor,
  } = config;

  const paddingLeft = isLeftAligned ? paddingXOuter : paddingX;
  const paddingRight = isLeftAligned ? paddingX : paddingXOuter;
  const mLeft = isLeftAligned ? marginXOuter : marginX;
  const mRight = isLeftAligned ? marginX : marginXOuter;
  const thumbCenterY = centerY;

  // Inner bounds (padding only)
  const innerLeft = left - paddingLeft;
  const innerRight = right + paddingRight;
  const innerTop = centerY - height / 2 - paddingY;
  const innerBottom = centerY + height / 2 + paddingY;
  const innerHeight = height + paddingY * 2;
  const innerRadius = innerHeight / 2;
  const innerRadiusLeft = isLeftAligned
    ? innerRadius * outerEdgeRadiusFactor
    : innerRadius;
  const innerRadiusRight = isLeftAligned
    ? innerRadius
    : innerRadius * outerEdgeRadiusFactor;

  // Outer bounds (padding + margin)
  const outerLeft = left - paddingLeft - mLeft;
  const outerRight = right + paddingRight + mRight;
  const outerTop = centerY - height / 2 - paddingY - marginY;
  const outerBottom = centerY + height / 2 + paddingY + marginY;
  const outerHeight = height + paddingY * 2 + marginY * 2;
  const outerRadius = outerHeight / 2;
  const outerRadiusLeft = isLeftAligned
    ? outerRadius * outerEdgeRadiusFactor
    : outerRadius;
  const outerRadiusRight = isLeftAligned
    ? outerRadius
    : outerRadius * outerEdgeRadiusFactor;

  const outerDist = signedDistanceToRoundedRect(
    thumbCenterX,
    thumbCenterY,
    outerLeft,
    outerRight,
    outerTop,
    outerBottom,
    outerRadiusLeft,
    outerRadiusRight,
  );

  if (outerDist > 0) return 0;

  const innerDist = signedDistanceToRoundedRect(
    thumbCenterX,
    thumbCenterY,
    innerLeft,
    innerRight,
    innerTop,
    innerBottom,
    innerRadiusLeft,
    innerRadiusRight,
  );

  const maxGap = height + paddingY * 2;
  if (innerDist <= 0) return maxGap;

  const totalDist = Math.abs(outerDist) + innerDist;
  const t = Math.abs(outerDist) / totalDist;

  return maxGap * t;
}
