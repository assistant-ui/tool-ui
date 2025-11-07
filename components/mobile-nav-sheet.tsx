"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, Scroll } from "@silk-hq/components";
import { Menu } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { componentsRegistry } from "@/lib/components-registry";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import "./mobile-nav-sheet.css";
import { Separator } from "./ui/separator";

export function MobileNavSheet() {
  const pathname = usePathname();
  const [presented, setPresented] = React.useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(true);

  const isHome = pathname === "/";
  const isComponents =
    pathname === "/components/gallery" || pathname === "/components";
  const isBuilder = pathname.startsWith("/builder");

  const mainNavLinks = [
    { href: "/", label: "Home", isActive: isHome },
    {
      href: "/components/gallery",
      label: "Components",
      isActive: isComponents,
    },
    { href: "/builder", label: "Builder", isActive: isBuilder },
  ];

  return (
    <Sheet.Root
      license="non-commercial"
      presented={presented}
      onPresentedChange={setPresented}
      defaultActiveDetent={1}
    >
      {/* Mobile Trigger Button */}
      <Sheet.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>
      </Sheet.Trigger>

      {/* Bottom Sheet Portal */}
      <Sheet.Portal>
        <Sheet.View
          className="MobileNavSheet-view"
          nativeEdgeSwipePrevention={true}
        >
          <Sheet.Backdrop
            className="MobileNavSheet-backdrop"
            travelAnimation={{
              opacity: [0, 0.8],
            }}
            themeColorDimming="auto"
          />
          <Sheet.Content className="MobileNavSheet-content">
            <Sheet.BleedingBackground className="MobileNavSheet-bleedingBackground" />

            {/* handle */}
            <div className="elative absolute top-0 right-0 left-0 z-20 flex items-center justify-center bg-transparent py-4">
              <div className="bg-muted-foreground h-1 w-12 rounded-full" />
            </div>

            {/* Top Scroll Indicator Gradient */}

            <div className="from-background pointer-events-none absolute top-0 right-0 left-0 z-10 h-24 rounded-tl-xl rounded-tr-xl bg-gradient-to-b to-transparent" />

            <Scroll.Root className="scrollbar-subtle flex-1 overflow-hidden">
              <Scroll.View
                className="h-full"
                safeArea="visual-viewport"
                nativeFocusScrollPrevention={true}
                onScroll={({ progress }) => {
                  // Hide bottom indicator when scrolled near the bottom (within 5%)
                  setShowScrollIndicator(progress < 0.95);
                }}
              >
                <Scroll.Content>
                  <nav className="flex flex-col gap-2 p-4 pt-12">
                    {mainNavLinks.map(({ href, label, isActive }) => (
                      <Sheet.Trigger key={href} asChild>
                        <Link
                          href={href}
                          className={cn(
                            "rounded-lg px-4 py-4 text-3xl font-medium transition-colors",
                            isActive
                              ? "bg-muted text-foreground"
                              : "text-primary hover:bg-muted/50 hover:text-foreground",
                          )}
                        >
                          {label}
                        </Link>
                      </Sheet.Trigger>
                    ))}
                  </nav>
                  <div className="my-3 px-8">
                    <Separator />
                  </div>
                  <div className="flex flex-col gap-1 px-4 py-8">
                    <div className="text-muted-foreground mb-3 px-4 text-xs tracking-widest uppercase">
                      Jump to component
                    </div>

                    {componentsRegistry.map((component) => {
                      const isActive = pathname === component.path;

                      return (
                        <Sheet.Trigger key={component.id} asChild>
                          <Link
                            href={component.path}
                            className={cn(
                              "text-primary rounded-lg px-4 py-3.5",
                              isActive
                                ? "bg-muted text-foreground font-medium"
                                : "text-primary hover:bg-muted/50 hover:text-foreground",
                            )}
                          >
                            {component.label}
                          </Link>
                        </Sheet.Trigger>
                      );
                    })}
                  </div>
                </Scroll.Content>
              </Scroll.View>
            </Scroll.Root>

            {/* Scroll Indicator Gradient */}
            {showScrollIndicator && (
              <div className="from-background pointer-events-none absolute right-0 bottom-16 left-0 h-20 bg-gradient-to-t to-transparent" />
            )}

            {/* Social Links Footer - Fixed to Bottom */}
            <div className="bg-background relative z-10 h-16 w-full px-4 py-3">
              <div className="flex w-full gap-2">
                <Button variant="outline" size="lg" className="flex-1" asChild>
                  <a
                    href="https://github.com/assistant-ui/tool-ui"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGithub className="size-6" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="flex-1" asChild>
                  <a
                    href="https://x.com/assistantui"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaXTwitter className="size-6" />
                  </a>
                </Button>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
}
