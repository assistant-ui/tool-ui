"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon } from "lucide-react";
import { componentsRegistry } from "@/lib/components-config";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tool-ui-components-nav-collapsed";

export function DocsNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored != null) setCollapsed(stored === "true");
      }
    } catch {}
  }, []);

  const buildLinkClasses = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-4 hover:bg-primary/5  active:text-foreground bg-background active:bg-primary/10 py-2 text-sm transition-[colors,background] duration-75",
      {
        "justify-center px-0": collapsed,
        "text-primary bg-primary/5": isActive,
        "text-muted-foreground": !isActive,
      },
    );

  const docsPages = [
    { path: "/docs/overview", label: "Overview" },
    { path: "/docs/quick-start", label: "Quick Start" },
    { path: "/docs/design-guidelines", label: "UI Design Guidelines" },
  ];

  const galleryPath = "/docs/gallery";
  const isGalleryActive = pathname === galleryPath;

  return (
    <aside
      className={cn(
        "bg-background flex h-full shrink-0 flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-full",
      )}
    >
      <nav className="flex flex-1 flex-col py-4">
        {/* Gallery Link */}
        <div className="mb-4 flex flex-col gap-2 px-4">
          <Link
            href={galleryPath}
            className={buildLinkClasses(isGalleryActive)}
            title={collapsed ? "Gallery" : undefined}
          >
            <LayoutDashboardIcon
              className={cn("text-muted-foreground size-4 shrink-0", {
                "text-primary": isGalleryActive,
              })}
            />
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate">Gallery</span>
              </div>
            )}
          </Link>
        </div>

        {/* Docs Section */}
        <div className="flex flex-col gap-1 px-4 pt-4">
          {!collapsed && (
            <div className="text-primary/40 mb-3 cursor-default px-4 text-xs tracking-widest uppercase select-none">
              Docs
            </div>
          )}
          {docsPages.map((page) => {
            const isActive = pathname === page.path;
            return (
              <Link
                key={page.path}
                href={page.path}
                className={buildLinkClasses(isActive)}
                title={collapsed ? page.label : undefined}
              >
                {!collapsed && (
                  <div className="overflow-hidden">
                    <span className="truncate">{page.label}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Components Section */}
        <div className="flex flex-col gap-1 px-4 pt-8">
          {!collapsed && (
            <div className="text-primary/40 mb-3 cursor-default px-4 text-xs tracking-widest uppercase select-none">
              Components
            </div>
          )}
          {componentsRegistry.map((component) => {
            const isActive = pathname === component.path;
            return (
              <Link
                key={component.id}
                href={component.path}
                className={buildLinkClasses(isActive)}
                title={collapsed ? component.label : undefined}
              >
                {!collapsed && (
                  <div className="overflow-hidden">
                    <span className="truncate">{component.label}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
