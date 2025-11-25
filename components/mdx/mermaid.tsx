"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";

interface MermaidProps {
  chart: string;
}

let mermaidPromise: Promise<typeof import("mermaid")> | null = null;

function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid");
  }
  return mermaidPromise;
}

export function Mermaid({ chart }: MermaidProps) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const render = async () => {
      const mermaid = await getMermaid();
      const isDark = resolvedTheme === "dark";

      mermaid.default.initialize({
        startOnLoad: false,
        theme: "base",
        securityLevel: "loose",
        themeVariables: {
          // Background
          background: isDark ? "#0a0a0a" : "#ffffff",
          primaryColor: isDark ? "#1e293b" : "#f1f5f9",

          // Text
          primaryTextColor: isDark ? "#e2e8f0" : "#1e293b",
          secondaryTextColor: isDark ? "#94a3b8" : "#64748b",

          // Lines and borders
          lineColor: isDark ? "#475569" : "#cbd5e1",
          primaryBorderColor: isDark ? "#475569" : "#cbd5e1",

          // Edge labels
          edgeLabelBackground: isDark ? "#1e293b" : "#f8fafc",
          tertiaryTextColor: isDark ? "#cbd5e1" : "#475569",

          // Font
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: "14px",
        },
      });

      const { svg: renderedSvg } = await mermaid.default.render(
        `mermaid-${id.replace(/:/g, "")}`,
        chart
      );

      // Post-process SVG to add padding to edge labels
      const parser = new DOMParser();
      const doc = parser.parseFromString(renderedSvg, "image/svg+xml");

      // Add padding to edge label backgrounds
      doc.querySelectorAll(".edgeLabel rect").forEach((rect) => {
        const currentX = parseFloat(rect.getAttribute("x") || "0");
        const currentY = parseFloat(rect.getAttribute("y") || "0");
        const currentWidth = parseFloat(rect.getAttribute("width") || "0");
        const currentHeight = parseFloat(rect.getAttribute("height") || "0");
        const padding = 6;

        rect.setAttribute("x", String(currentX - padding));
        rect.setAttribute("y", String(currentY - padding / 2));
        rect.setAttribute("width", String(currentWidth + padding * 2));
        rect.setAttribute("height", String(currentHeight + padding));
        rect.setAttribute("rx", "4");
      });

      const serializer = new XMLSerializer();
      setSvg(serializer.serializeToString(doc));
    };

    render();
  }, [chart, id, mounted, resolvedTheme]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/50 p-8">
        <span className="text-sm text-muted-foreground">Loading diagram...</span>
      </div>
    );
  }

  return (
    <div
      className="my-4 flex justify-center overflow-x-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
