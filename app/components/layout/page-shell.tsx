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
        <div className="hidden w-[220px] shrink-0 overflow-y-auto md:block">
          {sidebar}
        </div>
      ) : null}
      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
