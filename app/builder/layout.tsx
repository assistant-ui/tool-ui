"use client";

import { ReactNode, useState } from "react";
import { Hammer, Home, Shapes } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import Link from "next/link";
import { useRouter } from "next/navigation";

function BuilderHeader() {
  const router = useRouter();

  const handleValueChange = (value: string) => {
    if (value === "home") {
      router.push("/");
    } else if (value === "components") {
      router.push("/components");
    }
  };

  return (
    <header className="bg-wash flex shrink-0 items-center px-4 py-4">
      <div className="flex items-center gap-4">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-wide">tool-ui.com</h1>
        </Link>
        <Select value="builder" onValueChange={handleValueChange}>
          <SelectTrigger
            size="sm"
            className="text-foreground bg-background data-[state=open]:bg-background/50 shadow-crisp-edge border-0 px-2 py-0 text-sm font-medium select-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <SelectValue aria-label="Builder" />
          </SelectTrigger>
          <SelectContent className="min-w-44" align="start">
            <SelectItem value="home" className="px-4 py-2">
              <Home className="text-blue-600 dark:text-blue-500" />
              <span>Home</span>
            </SelectItem>
            <SelectItem value="components" className="px-4 py-2">
              <Shapes className="text-amber-600 dark:text-amber-500" />
              <span>Components</span>
            </SelectItem>
            <SelectItem value="builder" className="px-4 py-2">
              <Hammer className="text-green-600 dark:text-green-500" />
              <span>Builder</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}

export default function BuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  return (
    <div className="flex h-screen min-h-0 flex-col bg-background">
      <BuilderHeader />
      <div className="flex flex-1 overflow-hidden bg-background">{children}</div>
      <ViewportControls viewport={viewport} onViewportChange={setViewport} />
    </div>
  );
}
