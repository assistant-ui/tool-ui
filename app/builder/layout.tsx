import type { ReactNode } from "react";
import ContentLayout from "@/app/components/layout/page-shell";
import { HeaderFrame } from "@/app/components/layout/app-shell";
import { ResizableViewportProvider } from "@/app/components/builder/resizable-viewport-provider";
import { BuilderHeaderControls } from "./builder-header-controls";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <ResizableViewportProvider>
      <HeaderFrame rightContent={<BuilderHeaderControls />}>
        <ContentLayout>{children}</ContentLayout>
      </HeaderFrame>
    </ResizableViewportProvider>
  );
}
