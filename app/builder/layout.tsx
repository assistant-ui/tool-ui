import type { ReactNode } from "react";
import ContentLayout from "@/app/components/layout/page-shell";
import { HeaderFrame } from "@/app/components/layout/app-shell";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <HeaderFrame rightContent={<ThemeToggle />}>
      <ContentLayout>{children}</ContentLayout>
    </HeaderFrame>
  );
}
