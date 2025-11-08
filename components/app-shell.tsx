import { ReactNode } from "react";
import { ResponsiveHeader } from "@/components/responsive-header-server";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  rightContent?: ReactNode;
  sidebar?: ReactNode;
  noScroll?: boolean;
};

export default function AppShell({
  children,
  rightContent,
  sidebar,
  noScroll,
}: AppShellProps) {
  return (
    <div className="flex h-screen flex-col items-center pt-16">
      <div className="absolute top-0 w-full max-w-[2000px]">
        <ResponsiveHeader rightContent={rightContent} />
      </div>
      <div className="flex w-full max-w-[2000px] flex-1 justify-center overflow-hidden">
        {sidebar ? (
          <div className="bg-background hidden w-[220px] shrink-0 overflow-hidden md:block">
            {sidebar}
          </div>
        ) : null}
        <div
          className={cn("bg-background flex min-h-0 flex-1", {
            "overflow-auto": !noScroll,
            "overflow-hidden": noScroll,
          })}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
