import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  noScroll?: boolean;
};

export default function AppShell({
  children,
  sidebar,
  noScroll,
}: AppShellProps) {
  return (
    <div className="flex w-full max-w-[2000px] flex-1 justify-center overflow-hidden">
      {sidebar ? (
        <div className="hidden w-[220px] shrink-0 overflow-hidden md:block">
          {sidebar}
        </div>
      ) : null}
      <div
        className={cn("flex min-h-0 flex-1", {
          "overflow-auto": !noScroll,
          "overflow-hidden": noScroll,
        })}
      >
        {children}
      </div>
    </div>
  );
}
