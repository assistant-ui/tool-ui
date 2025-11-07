"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MobileNavSheet } from "@/components/mobile-nav-sheet";

interface ResponsiveHeaderProps {
  rightContent?: ReactNode;
}

export function ResponsiveHeader({ rightContent }: ResponsiveHeaderProps) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isComponents = pathname.startsWith("/components");
  const isBuilder = pathname.startsWith("/builder");

  const navLinks = [
    { href: "/", label: "Home", isActive: isHome },
    { href: "/components", label: "Components", isActive: isComponents },
    { href: "/builder", label: "Builder", isActive: isBuilder },
  ];

  return (
    <div className="flex gap-4 px-4 py-3 md:gap-8 md:px-6">
      <div className="flex w-fit shrink-0 items-center justify-start">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-wide">Tool UI</h1>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden flex-1 items-center justify-between md:flex">
        <nav className="flex items-center">
          {navLinks.map(({ href, label, isActive }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {rightContent}
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link
                href="https://github.com/assistant-ui/tool-ui"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub className="size-5" />
                <span className="sr-only">GitHub Repository</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link
                href="https://x.com/assistantui"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaXTwitter className="size-5" />
                <span className="sr-only">X (Twitter)</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button and Right Content */}
      <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
        {rightContent}
        <MobileNavSheet />
      </div>
    </div>
  );
}
