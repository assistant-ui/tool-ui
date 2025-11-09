"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shapes } from "lucide-react";
import { componentsRegistry } from "@/lib/components-config";
import { docsRegistry, type DocsPageMeta } from "@/lib/docs-registry";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "tool-ui-components-nav-collapsed";
const SHOW_DOCS_IN_NAV = false;

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
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
      isActive ? "bg-muted text-foreground" : "hover:bg-muted/50",
      collapsed && "justify-center px-0",
    );

  const galleryPath = "/docs/gallery";
  const isGalleryActive = pathname.startsWith(galleryPath);

  return (
    <aside
      className={cn(
        "bg-background flex h-full shrink-0 flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-full",
      )}
    >
      <nav className="flex flex-1 flex-col py-4">
        <div className="mb-4 flex flex-col gap-2 px-4">
          <Link
            href={galleryPath}
            className={buildLinkClasses(isGalleryActive)}
            title={collapsed ? "Gallery" : undefined}
          >
            <Shapes
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

        <Separator />

        <div className="h-4"></div>

        {/* Docs Section */}
        <div className="flex flex-col gap-12">
          {SHOW_DOCS_IN_NAV && (
            <div className="mt-4 flex flex-col gap-1 px-4">
              {!collapsed && (
                <div className="text-muted-foreground mb-2 cursor-default px-3 text-sm select-none">
                  Docs
                </div>
              )}
              {docsRegistry.map((doc: DocsPageMeta) => {
                const isActive = pathname.startsWith(doc.path);
                return (
                  <Link
                    key={doc.id}
                    href={doc.path}
                    className={buildLinkClasses(isActive)}
                    title={collapsed ? doc.label : undefined}
                  >
                    {!collapsed && (
                      <div className="overflow-hidden">
                        <span className="truncate">{doc.label}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Components Section */}
          <div className="flex flex-col gap-1 px-4 pt-4">
            {!collapsed && (
              <div className="text-muted-foreground mb-2 cursor-default px-3 text-sm select-none">
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
        </div>
      </nav>
    </aside>
  );
}
