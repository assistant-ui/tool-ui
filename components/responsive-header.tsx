"use client";

import { usePathname } from "next/navigation";

interface ActiveNavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ActiveNavLink({ href, children }: ActiveNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <a
      href={href}
      className={
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors" +
        (isActive
          ? " text-foreground"
          : " text-muted-foreground hover:text-foreground hover:bg-muted")
      }
    >
      {children}
    </a>
  );
}
