import type { ReactNode } from "react";
import AppShell from "@/components/app-shell";
import { ResponsiveHeader } from "@/components/responsive-header-server";
import { ComponentsLayoutClient } from "./_components/components-layout-client";
import { DocsHeaderControls } from "./_components/docs-header-controls";
import { DocsNav } from "./_components/docs-nav";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <ComponentsLayoutClient>
      <div className="flex h-screen flex-col items-center pt-16">
        <div className="absolute top-0 w-full max-w-[2000px]">
          <ResponsiveHeader rightContent={<DocsHeaderControls />} />
        </div>
        <AppShell sidebar={<DocsNav />}>{children}</AppShell>
      </div>
    </ComponentsLayoutClient>
  );
}
