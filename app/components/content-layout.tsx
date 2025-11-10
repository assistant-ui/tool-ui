import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentLayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  noScroll?: boolean;
};

export default function ContentLayout({
  children,
  sidebar,
  noScroll,
}: ContentLayoutProps) {
  return (
    <div className="flex w-full max-w-[2000px] min-h-0 flex-1 justify-center overflow-hidden">
      {sidebar ? (
        <div className="hidden w-[220px] shrink-0 overflow-y-auto md:block">
          {sidebar}
        </div>
      ) : null}
      <div
        className={cn("flex min-h-0 flex-1 w-full", {
          "overflow-auto": !noScroll,
          "overflow-hidden": noScroll,
        })}
      >
        {children}
      </div>
    </div>
  );
}
