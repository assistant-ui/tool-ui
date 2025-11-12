import type { ReactNode } from "react";
import { ResponsiveHeader } from "@/app/components/responsive-header-server";

type HeaderFrameProps = {
  children: ReactNode;
  rightContent?: ReactNode;
  background?: ReactNode;
};

export function HeaderFrame({
  children,
  rightContent,
  background,
}: HeaderFrameProps) {
  return (
    <div className="relative flex h-screen flex-col items-center overflow-hidden">
      {background ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          {background}
        </div>
      ) : null}
      <div className="relative z-10 w-full max-w-[1440px] shrink-0 px-4 md:px-8">
        <ResponsiveHeader rightContent={rightContent} />
      </div>
      <div className="relative z-10 flex min-h-0 w-full flex-1 justify-center overflow-hidden">
        {children}
      </div>
    </div>
  );
}
