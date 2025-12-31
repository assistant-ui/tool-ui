import type { ReactNode } from "react";
import type { Metadata } from "next";
import { DemoBanner } from "./demo-banner";

export const metadata: Metadata = {
  title: "Workbench | Tool UI",
  description:
    "Test and preview Tool UI components with the OpenAI Apps SDK interface",
};

export default function WorkbenchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <DemoBanner />
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}
