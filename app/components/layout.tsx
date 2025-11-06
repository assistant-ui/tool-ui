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
import { ComponentNav } from "./components/component-nav";
import { ComponentsProvider } from "./components-context";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import Link from "next/link";
import { useRouter } from "next/navigation";

function ComponentsHeader({
  currentPage,
  onPageChange,
  onNavigateHome
}: {
  currentPage: string;
  onPageChange: (page: string) => void;
  onNavigateHome: () => void;
}) {
  const handleValueChange = (value: string) => {
    if (value === "home") {
      onNavigateHome();
    } else {
      onPageChange(value);
    }
  };

  return (
    <header className="bg-wash flex shrink-0 items-center px-4 py-4">
      <div className="flex items-center gap-4">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-wide">tool-ui.com</h1>
        </Link>
        <Select value={currentPage} onValueChange={handleValueChange}>
          <SelectTrigger
            size="sm"
            className="text-foreground bg-background data-[state=open]:bg-background/50 shadow-crisp-edge border-0 px-2 py-0 text-sm font-medium select-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <SelectValue aria-label="Components" />
          </SelectTrigger>
          <SelectContent className="min-w-44" align="start">
            <SelectItem value="components" className="px-4 py-2">
              <Shapes className="text-amber-600 dark:text-amber-500" />
              <span>Components</span>
            </SelectItem>
            <SelectItem value="builder" className="px-4 py-2">
              <Hammer className="text-green-600 dark:text-green-500" />
              <span>Builder</span>
            </SelectItem>
            <SelectItem value="home" className="px-4 py-2">
              <Home className="text-blue-600 dark:text-blue-500" />
              <span>Home</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [currentPage, setCurrentPage] = useState<string>("components");

  const handleNavigateHome = () => {
    router.push("/");
  };

  return (
    <ComponentsProvider value={{ viewport }}>
      <div className="flex h-screen min-h-0 flex-col">
        <ComponentsHeader
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onNavigateHome={handleNavigateHome}
        />
        <div className="flex flex-1 overflow-hidden">
          {currentPage === "components" ? (
            <>
              <ComponentNav />
              <div className="flex flex-1 flex-col">{children}</div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Hammer className="mx-auto h-16 w-16 text-green-600 dark:text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Builder</h2>
                <p className="text-muted-foreground">Component builder coming soon...</p>
              </div>
            </div>
          )}
        </div>
        <ViewportControls viewport={viewport} onViewportChange={setViewport} />
      </div>
    </ComponentsProvider>
  );
}
