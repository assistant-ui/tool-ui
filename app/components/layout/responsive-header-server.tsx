import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { ActiveNavLink } from "./responsive-header";

interface ResponsiveHeaderProps {
  rightContent?: ReactNode;
}

export function ResponsiveHeader({ rightContent }: ResponsiveHeaderProps) {
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/docs/overview", label: "Docs" },
    { href: "/docs/gallery", label: "Components" },
    { href: "/builder", label: "Builder" },
    {
      href: "https://www.assistant-ui.com",
      label: "assistant-ui ↗",
      external: true,
    },
  ];

  return (
    <div className="flex gap-4 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-3 md:gap-8 md:pt-8">
      <div className="flex w-fit shrink-0 items-end justify-start gap-3 md:items-center">
        <Link href="/">
          <h1 className="-mb-1 text-xl font-bold md:mb-0">Tool UI</h1>
        </Link>
        <Badge
          variant="outline"
          className="text-muted-foreground cursor-default font-mono font-light select-none"
        >
          research preview
        </Badge>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden flex-1 items-center justify-between md:flex">
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, external }) =>
            external ? (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:bg-muted/50 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                {label}
              </Link>
            ) : (
              <ActiveNavLink key={href} href={href}>
                {label}
              </ActiveNavLink>
            ),
          )}
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
