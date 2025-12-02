import type { ReactNode } from "react";
import type { Metadata } from "next";
import ContentLayout from "@/app/components/layout/page-shell";
import { HeaderFrame } from "@/app/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Workbench | Tool UI",
  description: "Test and preview Tool UI components with the OpenAI Apps SDK interface",
};

export default function WorkbenchLayout({ children }: { children: ReactNode }) {
  return (
    <HeaderFrame>
      <ContentLayout>{children}</ContentLayout>
    </HeaderFrame>
  );
}
