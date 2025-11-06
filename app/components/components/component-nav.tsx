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
      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
      collapsed && "justify-center px-0",
    );

  const galleryPath = "/components/gallery";
  const isGalleryActive = pathname.startsWith(galleryPath);

  return (
    <aside
      className={cn(
        "bg-wash flex shrink-0 flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-54",
      )}
    >
      <div className="absolute bottom-4 left-0 flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className={cn("h-8 w-8 shrink-0", collapsed && "mx-auto")}
          title={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? (
            <LucideArrowRightToLine className="size-4" />
          ) : (
            <LucideArrowLeftToLine className="size-4" />
          )}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-4 p-2">
        <div className="flex flex-col gap-2">
          <Link
            href={galleryPath}
            className={buildLinkClasses(isGalleryActive)}
            title={collapsed ? "Gallery" : undefined}
          >
            <LayoutGrid
              className={cn("text-muted-foreground size-4 shrink-0", {
                "text-primary-foreground": isGalleryActive,
              })}
            />
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-medium">Gallery</span>
              </div>
            )}
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <Separator />
          {componentsRegistry.map((component) => {
            const Icon = component.icon;
            const isActive = pathname === component.path;

            return (
              <Link
                key={component.id}
                href={component.path}
                className={buildLinkClasses(isActive)}
                title={collapsed ? component.label : undefined}
              >
                <Icon
                  className={cn("text-muted-foreground size-4 shrink-0", {
                    "text-primary-foreground": isActive,
                  })}
                />
                {!collapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium">
                      {component.label}
                    </span>
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
