"use client";

import { cn } from "@/lib/ui/cn";
import { useWorkbenchTheme, useDeviceType } from "@/app/workbench/lib/store";
import type { DeviceType } from "@/app/workbench/lib/types";

interface DeviceFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const FRAME_CONFIG: Record<
  Exclude<DeviceType, "desktop">,
  {
    bezelWidth: string;
    borderRadius: string;
    screenRadius: string;
    showNotch: boolean;
  }
> = {
  mobile: {
    bezelWidth: "p-1",
    borderRadius: "rounded-[2rem]",
    screenRadius: "rounded-[1.75rem]",
    showNotch: false,
  },
  tablet: {
    bezelWidth: "p-1.5",
    borderRadius: "rounded-[1.25rem]",
    screenRadius: "rounded-[1rem]",
    showNotch: false,
  },
  resizable: {
    bezelWidth: "p-1",
    borderRadius: "rounded-[1rem]",
    screenRadius: "rounded-[0.75rem]",
    showNotch: false,
  },
};

function DynamicIsland({ isDark }: { isDark: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
      <div
        className={cn(
          "h-7 w-24 rounded-full",
          isDark ? "bg-black" : "bg-neutral-950",
        )}
      />
    </div>
  );
}

export function DeviceFrame({ children, className, style }: DeviceFrameProps) {
  const theme = useWorkbenchTheme();
  const deviceType = useDeviceType();
  const isDark = theme === "dark";

  if (deviceType === "desktop") {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const config = FRAME_CONFIG[deviceType];

  return (
    <div
      className={cn(
        "flex flex-col shadow-xl transition-colors",
        config.bezelWidth,
        config.borderRadius,
        isDark
          ? "bg-neutral-800 shadow-black/30"
          : "bg-neutral-200 shadow-black/10",
        className,
      )}
      style={style}
    >
      <div
        className={cn(
          "relative flex-1 overflow-hidden transition-colors",
          config.screenRadius,
          isDark ? "bg-neutral-900" : "bg-white",
        )}
      >
        {config.showNotch && <DynamicIsland isDark={isDark} />}
        {children}
      </div>
    </div>
  );
}
