import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

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
    <div className="flex min-h-0 w-full max-w-[1440px] flex-1 justify-center">
      {sidebar ? (
        <div className="hidden w-[220px] shrink-0 overflow-y-auto md:block">
          {sidebar}
        </div>
      ) : null}
      <div
        className={cn("flex min-h-0 w-full flex-1", {
          "overflow-auto": !noScroll,
          "overflow-hidden": noScroll,
        })}
      >
        {children}
      </div>
    </div>
  );
}
