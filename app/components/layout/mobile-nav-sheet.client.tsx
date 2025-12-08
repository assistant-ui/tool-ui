"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, Scroll } from "@silk-hq/components";
import { Menu } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { componentsRegistry } from "@/lib/docs/component-registry";
import { BASE_DOCS_PAGES } from "@/app/docs/_components/docs-pages";
import { cn } from "@/lib/ui/cn";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import "@/app/styles/nav-sheet.css";

export function MobileNavSheet() {
  const pathname = usePathname();
  const [presented, setPresented] = React.useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(true);

  const isHome = pathname === "/";
  const isDocs = pathname.startsWith("/docs") && pathname !== "/docs/gallery";
  const isGallery = pathname === "/docs/gallery";
  const isBuilder = pathname.startsWith("/builder");

  const mainNavLinks = [
    { href: "/", label: "Home", isActive: isHome },
    { href: "/docs/overview", label: "Docs", isActive: isDocs },
    { href: "/docs/gallery", label: "Gallery", isActive: isGallery },
    { href: "/builder", label: "Builder", isActive: isBuilder },
  ];

  return (
    <Sheet.Root
      license="non-commercial"
      presented={presented}
      onPresentedChange={setPresented}
      defaultActiveDetent={1}
    >
      {/* Floating Action Button */}
      <Sheet.Trigger asChild>
        <Button
          variant="default"
          size="icon"
          className="MobileNavSheet-trigger z-50 size-14 rounded-full shadow-lg md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-6" />
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
            <div className="from-background pointer-events-none absolute top-0 right-0 left-0 z-10 h-24 rounded-tl-xl rounded-tr-xl bg-linear-to-b to-transparent" />

            <Scroll.Root className="scrollbar-subtle relative flex-1 overflow-hidden">
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
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setPresented(false)}
                        className={cn(
                          "rounded-lg px-4 py-4 text-3xl font-medium transition-colors",
                          isActive
                            ? "bg-muted text-foreground"
                            : "text-primary hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                  <div className="my-3 px-8">
                    <Separator />
                  </div>

                  {/* Docs Section */}
                  <div className="flex flex-col gap-1 px-4 py-8">
                    <div className="text-muted-foreground mb-3 px-4 text-xs tracking-widest uppercase">
                      Get Started
                    </div>

                    {BASE_DOCS_PAGES.map((page) => {
                      const isActive = pathname === page.path;

                      return (
                        <Link
                          key={page.path}
                          href={page.path}
                          onClick={() => setPresented(false)}
                          className={cn(
                            "text-primary rounded-lg px-4 py-3.5",
                            isActive
                              ? "bg-muted text-foreground font-medium"
                              : "text-primary hover:bg-muted/50 hover:text-foreground",
                          )}
                        >
                          {page.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Components Section */}
                  <div className="flex flex-col gap-1 px-4 pb-8">
                    <div className="text-muted-foreground mb-3 px-4 text-xs tracking-widest uppercase">
                      Components
                    </div>

                    {componentsRegistry.map((component) => {
                      const isActive = pathname === component.path;

                      return (
                        <Link
                          key={component.id}
                          href={component.path}
                          onClick={() => setPresented(false)}
                          className={cn(
                            "text-primary rounded-lg px-4 py-3.5",
                            isActive
                              ? "bg-muted text-foreground font-medium"
                              : "text-primary hover:bg-muted/50 hover:text-foreground",
                          )}
                        >
                          {component.label}
                        </Link>
                      );
                    })}
                  </div>
                </Scroll.Content>
              </Scroll.View>

              {/* Bottom Scroll Indicator Gradient */}
              {showScrollIndicator && (
                <div className="MobileNavSheet-bottomGradient" />
              )}
            </Scroll.Root>

            {/* Social Links Footer */}
            <footer className="MobileNavSheet-footer">
              <div className="MobileNavSheet-footerInner">
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
            </footer>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
}
