import { ReactNode } from "react";
import AppShell from "@/components/app-shell";
import { ResponsiveHeader } from "@/components/responsive-header-server";
import {
  BuilderHeaderControls,
  BuilderLayoutClient,
} from "./builder-layout-client";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <BuilderLayoutClient>
      <div className="flex h-screen flex-col items-center pt-16">
        <div className="absolute top-0 w-full max-w-[2000px]">
          <ResponsiveHeader rightContent={<BuilderHeaderControls />} />
        </div>
        <AppShell noScroll>{children}</AppShell>
      </div>
    </BuilderLayoutClient>
  );
}
