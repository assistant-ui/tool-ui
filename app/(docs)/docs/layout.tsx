import type { ReactNode } from "react";
import { ComponentsLayoutClient } from "./_components/components-layout-client";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <ComponentsLayoutClient>{children}</ComponentsLayoutClient>;
}
