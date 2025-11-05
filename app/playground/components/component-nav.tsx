"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideArrowLeftToLine, LucideArrowRightToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { componentsRegistry } from "@/lib/components-registry";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tool-ui-playground-nav-collapsed";

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

  return (
    <aside
      className={cn(
        "bg-wash flex shrink-0 flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && <span className="text-sm font-medium">Components</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className={cn("h-8 w-8 shrink-0", collapsed && "mx-auto")}
          title={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? (
            <LucideArrowRightToLine className="h-4 w-4" />
          ) : (
            <LucideArrowLeftToLine className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {componentsRegistry.map((component) => {
          const Icon = component.icon;
          const isActive = pathname === component.path;

          return (
            <Link
              key={component.id}
              href={component.path}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? component.label : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0")} />
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
      </nav>
    </aside>
  );
}
