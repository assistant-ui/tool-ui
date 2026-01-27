"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { LayoutDashboardIcon } from "lucide-react";
import {
  componentsRegistry,
  CATEGORY_META,
  type ComponentCategory,
} from "@/lib/docs/component-registry";
import { cn } from "@/lib/ui/cn";
import { BASE_DOCS_PAGES } from "./docs-pages";

const STORAGE_KEY = "tool-ui-components-nav-collapsed";

export function DocsNav() {
  const pathname = usePathname();
  const [currentTab] = useQueryState("tab");
  const [collapsed, setCollapsed] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored != null) setCollapsed(stored === "true");
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    setIsPressing(false);
  }, [pathname]);

  React.useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isNavLink = target.closest('a[href^="/docs"]');
      if (!isNavLink) {
        setIsPressing(false);
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const buildLinkClasses = (isActive: boolean) =>
    cn(
      "flex items-center gap-2 rounded-lg px-4  bg-background text-primary  py-2 text-sm transition-[colors,background] duration-75",
      {
        "justify-center px-0": collapsed,

        "bg-primary/5": isActive && !isPressing,
        "hover:bg-primary/2": !isActive,
        "hover:bg-primary/5": isPressing && !isActive,
      },
    );

  const handleLinkMouseDown = () => setIsPressing(true);

  const galleryPath = "/docs/gallery";
  const isGalleryActive = pathname === galleryPath;

  const categorizedComponents = (
    Object.entries(CATEGORY_META) as [ComponentCategory, (typeof CATEGORY_META)[ComponentCategory]][]
  )
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([category, meta]) => ({
      category,
      label: meta.label,
      components: componentsRegistry.filter((c) => c.category === category),
    }));

  return (
    <aside
      className={cn(
        "bg-background flex h-full shrink-0 flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-full",
      )}
    >
      <nav className="flex flex-1 flex-col py-4 pb-24">
        <div className="mb-4 flex flex-col gap-2 px-4">
          <Link
            href={galleryPath}
            className={buildLinkClasses(isGalleryActive)}
            title={collapsed ? "Gallery" : undefined}
            onMouseDown={handleLinkMouseDown}
          >
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate">Gallery</span>
              </div>
            )}
            <LayoutDashboardIcon
              className={cn("text-muted-foreground size-4 shrink-0", {
                "text-primary": isGalleryActive,
              })}
            />
          </Link>
        </div>

        <div className="flex flex-col gap-1 px-4 pt-4">
          {!collapsed && (
            <div className="text-primary/60 mb-3 cursor-default px-4 text-xs tracking-widest uppercase select-none">
              Get Started
            </div>
          )}
          {BASE_DOCS_PAGES.map((page) => {
            const isActive = pathname === page.path;
            return (
              <Link
                key={page.path}
                href={page.path}
                className={buildLinkClasses(isActive)}
                title={collapsed ? page.label : undefined}
                onMouseDown={handleLinkMouseDown}
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

        {categorizedComponents.map(({ category, label, components }) => (
          <div key={category} className="flex flex-col gap-1 px-4 pt-8">
            {!collapsed && (
              <div className="text-primary/60 mb-3 cursor-default px-4 text-xs tracking-widest uppercase select-none">
                {label}
              </div>
            )}
            {components.map((component) => {
              const isActive = pathname === component.path;
              const href =
                currentTab === "examples"
                  ? `${component.path}?tab=examples`
                  : component.path;
              return (
                <Link
                  key={component.id}
                  href={href}
                  className={buildLinkClasses(isActive)}
                  title={collapsed ? component.label : undefined}
                  onMouseDown={handleLinkMouseDown}
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
        ))}
      </nav>
    </aside>
  );
}
