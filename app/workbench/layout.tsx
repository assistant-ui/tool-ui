import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workbench | Tool UI",
  description: "Test and preview Tool UI components with the OpenAI Apps SDK interface",
};

export default function WorkbenchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {children}
    </div>
  );
}
