import type { ReactNode } from "react";

type ContentLayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
};

export default function ContentLayout({
  children,
  sidebar,
}: ContentLayoutProps) {
  return (
    <div className="flex min-h-0 w-full max-w-[1440px] flex-1">
      {sidebar ? (
        <div className="relative hidden w-[220px] shrink-0 md:block">
          <div
            className="from-background pointer-events-none absolute top-0 right-2 left-0 z-10 h-12 bg-linear-to-b to-transparent"
            aria-hidden="true"
          />
          <div className="scrollbar-subtle h-full overflow-y-auto pt-4">
            {sidebar}
          </div>
          <div
            className="from-background pointer-events-none absolute right-2 bottom-0 left-0 z-10 h-12 bg-linear-to-t to-transparent"
            aria-hidden="true"
          />
        </div>
      ) : null}
      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
