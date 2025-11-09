import type { ReactNode } from "react";
import ContentLayout from "@/components/content-layout";
import { HeaderFrame } from "@/components/header-frame";
import { ResizableViewportProvider } from "@/components/resizable-viewport-provider";
import { BuilderHeaderControls } from "./builder-header-controls";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <ResizableViewportProvider>
      <HeaderFrame rightContent={<BuilderHeaderControls />}>
        <ContentLayout noScroll>{children}</ContentLayout>
      </HeaderFrame>
    </ResizableViewportProvider>
  );
}
