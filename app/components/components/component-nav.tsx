"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideArrowLeftToLine,
  LucideArrowRightToLine,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { componentsRegistry } from "@/lib/components-registry";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "tool-ui-components-nav-collapsed";

export function ComponentNav() {
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

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, String(newState));
      }
    } catch {}
  };

  const buildLinkClasses = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
      isActive ? "bg-muted text-foreground font-medium" : "hover:bg-muted/50",
      collapsed && "justify-center px-0",
    );

  const galleryPath = "/components/gallery";
  const isGalleryActive = pathname.startsWith(galleryPath);

  return (
    <aside
      className={cn(
        "bg-background flex shrink-0 flex-col transition-all duration-300 h-full",
        collapsed ? "w-16" : "w-full",
      )}
    >
      <nav className="flex flex-1 flex-col py-4">
        <div className="flex flex-col gap-2 px-4 mb-4">
          <Link
            href={galleryPath}
            className={buildLinkClasses(isGalleryActive)}
            title={collapsed ? "Gallery" : undefined}
          >
            <LayoutGrid
              className={cn("text-muted-foreground size-4 shrink-0", {
                "text-primary": isGalleryActive,
              })}
            />
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-medium">Gallery</span>
              </div>
            )}
          </Link>
        </div>
        <Separator />
        <div className="flex flex-col gap-1 px-4 mt-4">
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
                  <div className="flex flex-col overflow-hidden">
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
