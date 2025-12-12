import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LogoMark } from "@/components/ui/logo";
import { ActiveNavLink } from "./header-active-link.client";

interface ResponsiveHeaderProps {
  rightContent?: ReactNode;
}

export function ResponsiveHeader({ rightContent }: ResponsiveHeaderProps) {
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/docs/overview", label: "Docs" },
    { href: "/docs/gallery", label: "Gallery" },
  ];

  return (
    <div className="pt-calc(env(safe-area-inset-top)+0.5rem) flex gap-4 pt-4 pb-2 sm:pt-8 sm:pb-3 md:gap-8">
      <div className="flex w-fit shrink-0 items-center justify-start gap-3 md:items-center">
        <Link href="/" className="flex items-center gap-1.5">
          <LogoMark className="-mb-0.5 size-5" />
          <h1 className="text-2xl font-semibold">Tool UI</h1>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden flex-1 items-center justify-between md:flex md:pl-18">
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <ActiveNavLink key={href} href={href}>
              {label}
            </ActiveNavLink>
          ))}
          <Link
            href="https://www.assistant-ui.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground hover:bg-muted/50 hidden rounded-lg px-4 py-2 text-sm font-medium transition-colors lg:block"
          >
            assistant-ui ↗
          </Link>
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

      {/* Mobile Right Content */}
      <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
        {rightContent}
      </div>
    </div>
  );
}
