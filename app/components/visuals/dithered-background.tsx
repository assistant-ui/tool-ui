type DitheredBackgroundProps = {
  className?: string;
  pixelSize?: number;
  ditherColor?: string;
  sections?: number; // Number of dithered chunks to render (1-8)
};

export function DitheredBackground({
  className = "pointer-events-none absolute inset-0 h-full w-1/2 opacity-15",
  pixelSize = 3,
  ditherColor = "rgb(156, 163, 175)",
  sections = 8,
}: DitheredBackgroundProps) {
  // All available dither patterns from darkest to lightest
  const patterns = [
    "dither-100",
    "dither-87",
    "dither-75",
    "dither-62",
    "dither-50",
    "dither-37",
    "dither-25",
    "dither-12",
  ];

  // Clamp sections to valid range
  const numSections = Math.max(1, Math.min(8, sections));

  // Select evenly spaced patterns
  const selectedPatterns =
    numSections === 8
      ? patterns
      : Array.from({ length: numSections }, (_, i) => {
          const index = Math.floor((i * patterns.length) / numSections);
          return patterns[index];
        });

  // Calculate width and positions
  const widthPercent = 100 / numSections;
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Pattern 1: Horizontal lines (darkest/densest) */}
        <pattern
          id="dither-100"
          patternUnits="userSpaceOnUse"
          width={pixelSize}
          height={pixelSize * 2}
        >
          <rect width={pixelSize} height={pixelSize * 2} fill="transparent" />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={0}
            y={0}
            fill={ditherColor}
          />
        </pattern>

        {/* Pattern 2: Tight checkerboard */}
        <pattern
          id="dither-87"
          patternUnits="userSpaceOnUse"
          width={pixelSize * 2}
          height={pixelSize * 2}
        >
          <rect
            width={pixelSize * 2}
            height={pixelSize * 2}
            fill="transparent"
          />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={0}
            y={0}
            fill={ditherColor}
          />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={pixelSize}
            y={pixelSize}
            fill={ditherColor}
          />
        </pattern>

        {/* Pattern 3: Vertical lines */}
        <pattern
          id="dither-75"
          patternUnits="userSpaceOnUse"
          width={pixelSize * 2}
          height={pixelSize}
        >
          <rect width={pixelSize * 2} height={pixelSize} fill="transparent" />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={0}
            y={0}
            fill={ditherColor}
          />
        </pattern>

        {/* Pattern 4: Diagonal pattern */}
        <pattern
          id="dither-62"
          patternUnits="userSpaceOnUse"
          width={pixelSize * 4}
          height={pixelSize * 4}
        >
          <rect
            width={pixelSize * 4}
            height={pixelSize * 4}
            fill="transparent"
          />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={0}
            y={0}
            fill={ditherColor}
          />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={pixelSize}
            y={pixelSize}
            fill={ditherColor}
          />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={pixelSize * 2}
            y={pixelSize * 2}
            fill={ditherColor}
          />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={pixelSize * 3}
            y={pixelSize * 3}
            fill={ditherColor}
          />
        </pattern>

        {/* Pattern 5: Larger checkerboard */}
        <pattern
          id="dither-50"
          patternUnits="userSpaceOnUse"
          width={pixelSize * 4}
          height={pixelSize * 4}
        >
          <rect
            width={pixelSize * 4}
            height={pixelSize * 4}
            fill="transparent"
          />
          <rect
            width={pixelSize * 2}
            height={pixelSize * 2}
            x={0}
            y={0}
            fill={ditherColor}
          />
          <rect
            width={pixelSize * 2}
            height={pixelSize * 2}
            x={pixelSize * 2}
            y={pixelSize * 2}
            fill={ditherColor}
          />
        </pattern>

        {/* Pattern 6: Sparse vertical stripes */}
        <pattern
          id="dither-37"
          patternUnits="userSpaceOnUse"
          width={pixelSize * 4}
          height={pixelSize}
        >
          <rect width={pixelSize * 4} height={pixelSize} fill="transparent" />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={0}
            y={0}
            fill={ditherColor}
          />
        </pattern>

        {/* Pattern 7: Dotted grid */}
        <pattern
          id="dither-25"
          patternUnits="userSpaceOnUse"
          width={pixelSize * 4}
          height={pixelSize * 4}
        >
          <rect
            width={pixelSize * 4}
            height={pixelSize * 4}
            fill="transparent"
          />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={pixelSize}
            y={pixelSize}
            fill={ditherColor}
          />
        </pattern>

        {/* Pattern 8: Very sparse dots (lightest) */}
        <pattern
          id="dither-12"
          patternUnits="userSpaceOnUse"
          width={pixelSize * 6}
          height={pixelSize * 6}
        >
          <rect
            width={pixelSize * 6}
            height={pixelSize * 6}
            fill="transparent"
          />
          <rect
            width={pixelSize}
            height={pixelSize}
            x={pixelSize * 2}
            y={pixelSize * 2}
            fill={ditherColor}
          />
        </pattern>
      </defs>

      {/* Layer the patterns to create gradient */}
      {selectedPatterns.map((pattern, i) => (
        <rect
          key={pattern}
          width={`${widthPercent}%`}
          height="100%"
          x={`${i * widthPercent}%`}
          fill={`url(#${pattern})`}
        />
      ))}
    </svg>
  );
}
