import type { ReactNode } from "react";
import { ResponsiveHeader } from "@/app/components/responsive-header-server";

type HeaderFrameProps = {
  children: ReactNode;
  rightContent?: ReactNode;
};

export function HeaderFrame({ children, rightContent }: HeaderFrameProps) {
  return (
    <div className="flex h-screen flex-col items-center overflow-hidden">
      <div className="w-full max-w-[2000px] shrink-0 px-4 md:px-8">
        <ResponsiveHeader rightContent={rightContent} />
      </div>
      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
