import type { ReactNode } from "react";
import ContentLayout from "@/app/components/layout/page-shell";
import { HeaderFrame } from "@/app/components/layout/app-shell";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { DocsNav } from "./_components/docs-nav";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <HeaderFrame rightContent={<ThemeToggle />}>
      <ContentLayout sidebar={<DocsNav />}>{children}</ContentLayout>
    </HeaderFrame>
  );
}
