import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ContentLayout from "@/app/components/layout/page-shell";
import { HeaderFrame } from "@/app/components/layout/app-shell";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { DocsNav } from "./_components/docs-nav";

export const dynamic = "force-dynamic";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <HeaderFrame rightContent={<ThemeToggle />}>
        <ContentLayout sidebar={<DocsNav />}>{children}</ContentLayout>
      </HeaderFrame>
    </NuqsAdapter>
  );
}
