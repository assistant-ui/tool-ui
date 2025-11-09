import type { ReactNode } from "react";
import ContentLayout from "@/app/components/content-layout";
import { HeaderFrame } from "@/app/components/header-frame";
import { ResizableViewportProvider } from "@/app/components/resizable-viewport-provider";
import { DocsHeaderControls } from "./_components/docs-header-controls";
import { DocsNav } from "./_components/docs-nav";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <ResizableViewportProvider>
      <HeaderFrame rightContent={<DocsHeaderControls />}>
        <ContentLayout sidebar={<DocsNav />}>{children}</ContentLayout>
      </HeaderFrame>
    </ResizableViewportProvider>
  );
}
