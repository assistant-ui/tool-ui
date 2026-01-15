"use client";

import type { ReactNode } from "react";
import { ResponsiveHeader } from "@/app/components/layout/app-header.server";

type HeaderFrameProps = {
  children: ReactNode;
  rightContent?: ReactNode;
  background?: ReactNode;
  animateNavbar?: boolean;
};

export function HeaderFrame({
  children,
  rightContent,
  background,
  animateNavbar = false,
}: HeaderFrameProps) {
  return (
    <div className="relative flex h-dvh flex-col items-center overflow-hidden">
      {background ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          {background}
        </div>
      ) : null}
      <div
        className="relative z-10 w-full max-w-[1440px] shrink-0 px-4 md:px-8"
        style={
          animateNavbar
            ? {
                animation: "navbar-fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }
            : undefined
        }
      >
        <ResponsiveHeader rightContent={rightContent} />
      </div>
      <div className="relative z-10 flex min-h-0 w-full flex-1 justify-center overflow-hidden">
        {children}
      </div>
      <style jsx>{`
        @keyframes navbar-fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
