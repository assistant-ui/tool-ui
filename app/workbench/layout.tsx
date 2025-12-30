import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workbench | Tool UI",
  description:
    "Test and preview Tool UI components with the OpenAI Apps SDK interface",
};

function DemoBanner() {
  return (
    <div className="bg-muted/80 text-muted-foreground flex h-8 shrink-0 items-center justify-center gap-1.5 border-b px-4 text-xs">
      <span>This is a demo.</span>
      <span>
        Get the full Workbench with{" "}
        <code className="bg-background rounded px-1 py-0.5 font-mono text-[11px]">
          npx @assistant-ui/create-chatgpt-app
        </code>
      </span>
    </div>
  );
}

export default function WorkbenchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <DemoBanner />
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}
