/**
 * Generates a data URI for a subtle noise texture to reduce gradient banding
 * @param size - Size of the noise tile (default: 64px)
 * @param opacity - Opacity of the noise (0-1, default: 0.02)
 */
export function generateNoiseDataUri(size: number = 64, opacity: number = 0.02): string {
  // Create a minimal noise pattern using SVG
  // This is more efficient than canvas and works in SSR
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="0 ${opacity}" />
        </feComponentTransfer>
      </filter>
      <rect width="${size}" height="${size}" filter="url(#noise)" />
    </svg>
  `.trim();

  // Use btoa for client-side base64 encoding
  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  // For SSR, use URL encoding instead
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * CSS style object for applying noise texture over gradients
 */
export function getNoiseOverlayStyle(opacity: number = 0.02) {
  return {
    backgroundImage: `url("${generateNoiseDataUri(64, opacity)}")`,
    backgroundBlendMode: 'overlay' as const,
  };
}
