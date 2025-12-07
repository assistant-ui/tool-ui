"use client";

export function CollaborationDiagram() {
  return (
    <svg
      viewBox="0 0 600 200"
      className="mx-auto w-full max-w-2xl"
      aria-label="Collaboration model: User controls Tool UI, Tool UI mediates with Assistant, Assistant narrates to User"
    >
      <defs>
        <marker
          id="arrow-blue"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#3b82f6" />
        </marker>
        <marker
          id="arrow-green"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#10b981" />
        </marker>
        <marker
          id="arrow-purple"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      {/* User circle */}
      <circle
        cx="80"
        cy="100"
        r="48"
        fill="#3b82f6"
      />
      <text
        x="80"
        y="100"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="16"
        fontWeight="500"
        fontFamily="system-ui, sans-serif"
      >
        User
      </text>

      {/* Tool UI rounded rectangle */}
      <rect
        x="240"
        y="60"
        width="120"
        height="80"
        rx="12"
        ry="12"
        fill="#10b981"
      />
      <text
        x="300"
        y="100"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="16"
        fontWeight="500"
        fontFamily="system-ui, sans-serif"
      >
        Tool UI
      </text>

      {/* Assistant circle */}
      <circle
        cx="520"
        cy="100"
        r="48"
        fill="#8b5cf6"
      />
      <text
        x="520"
        y="100"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="16"
        fontWeight="500"
        fontFamily="system-ui, sans-serif"
      >
        Assistant
      </text>

      {/* User → Surface: "controls" (solid) */}
      <path
        d="M128,100 L232,100"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        markerEnd="url(#arrow-blue)"
      />
      <text
        x="180"
        y="92"
        textAnchor="middle"
        fill="#3b82f6"
        fontSize="12"
        fontFamily="system-ui, sans-serif"
      >
        controls
      </text>

      {/* Surface ↔ Assistant: "mediates" (solid, bidirectional) */}
      <path
        d="M360,90 L464,90"
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        markerEnd="url(#arrow-green)"
      />
      <path
        d="M472,110 L368,110"
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        markerEnd="url(#arrow-green)"
      />
      <text
        x="412"
        y="82"
        textAnchor="middle"
        fill="#10b981"
        fontSize="12"
        fontFamily="system-ui, sans-serif"
      >
        mediates
      </text>

      {/* Assistant → User: "narrates" (dashed, curved) */}
      <path
        d="M480,140 Q300,200 120,140"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.5"
        strokeDasharray="4,3"
        markerEnd="url(#arrow-purple)"
      />
      <text
        x="300"
        y="185"
        textAnchor="middle"
        fill="#8b5cf6"
        fontSize="12"
        fontFamily="system-ui, sans-serif"
      >
        narrates
      </text>
    </svg>
  );
}
