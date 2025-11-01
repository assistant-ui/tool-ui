import Link from "next/link";
import { DemoChat } from "@/app/components/demo-chat";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-row items-center justify-center">
      <div className="max-w-2xl space-y-8 p-8 text-left">
        <h1 className="text-6xl font-bold tracking-tight">ToolUI</h1>
        <p className="text-muted-foreground text-lg">
          Open source tool call components for AI chat interfaces. Responsive,
          accessible, data-driven. Built with React, TypeScript, and Tailwind.
          Animated with Motion.
        </p>
        <div className="flex justify-start gap-4">
          <Link
            href="/playground"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-3 font-medium transition-colors"
          >
            Go to Playground
          </Link>
        </div>
      </div>
      <div className="flex h-screen flex-1 border-l">
        <DemoChat />
      </div>
    </main>
  );
}
