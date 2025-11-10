import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { ActiveNavLink } from "./responsive-header";

interface ResponsiveHeaderProps {
  rightContent?: ReactNode;
}

export function ResponsiveHeader({ rightContent }: ResponsiveHeaderProps) {
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/docs/gallery", label: "Components" },
    { href: "/builder", label: "Builder" },
  ];

  return (
    <div className="flex gap-4 py-3 md:gap-8">
      <div className="flex w-fit shrink-0 items-center justify-start">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-wide">Tool UI</h1>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden flex-1 items-center justify-between md:flex">
        <nav className="flex items-center">
          {navLinks.map(({ href, label }) => (
            <ActiveNavLink key={href} href={href}>
              {label}
            </ActiveNavLink>
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

      {/* Mobile Right Content */}
      <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
        {rightContent}
      </div>
    </div>
  );
}
