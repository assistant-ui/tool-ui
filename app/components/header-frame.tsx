import type { ReactNode } from "react";
import { ResponsiveHeader } from "@/app/components/responsive-header-server";

type HeaderFrameProps = {
  children: ReactNode;
  rightContent?: ReactNode;
};

export function HeaderFrame({ children, rightContent }: HeaderFrameProps) {
  return (
    <div className="flex h-screen flex-col items-center overflow-hidden">
      <div className="bg-background/95 supports-backdrop-filter:bg-background/75 w-full max-w-[2000px] shrink-0 backdrop-blur">
        <ResponsiveHeader rightContent={rightContent} />
      </div>
      <div className="flex w-full min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
