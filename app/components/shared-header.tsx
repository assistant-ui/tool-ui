"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SharedHeader() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isComponents = pathname.startsWith("/components");
  const isBuilder = pathname.startsWith("/builder");

  return (
    <header className="bg-wash border-b flex shrink-0 items-center px-6 py-3">
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-wide">tool-ui.com</h1>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isHome
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            Home
          </Link>
          <Link
            href="/components"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isComponents
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            Components
          </Link>
          <Link
            href="/builder"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isBuilder
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            Builder
          </Link>
        </nav>
      </div>
    </header>
  );
}
