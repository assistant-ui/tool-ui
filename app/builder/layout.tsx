import type { ReactNode } from "react";
import ContentLayout from "@/app/components/content-layout";
import { HeaderFrame } from "@/app/components/header-frame";
import { ResizableViewportProvider } from "@/app/components/resizable-viewport-provider";
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
