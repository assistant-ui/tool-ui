"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui/cn";

interface ActiveNavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ActiveNavLink({ href, children }: ActiveNavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "active:bg-primary/10 rounded-lg px-4 py-2 text-sm transition-[colors,background] duration-75",
        isActive ? "bg-primary/5" : "hover:bg-primary/5",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
