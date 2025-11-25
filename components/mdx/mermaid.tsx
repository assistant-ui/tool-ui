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
      mermaid.default.initialize({
        startOnLoad: false,
        theme: resolvedTheme === "dark" ? "dark" : "default",
        securityLevel: "loose",
      });

      const { svg: renderedSvg } = await mermaid.default.render(
        `mermaid-${id.replace(/:/g, "")}`,
        chart
      );
      setSvg(renderedSvg);
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
