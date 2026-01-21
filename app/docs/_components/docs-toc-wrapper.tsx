"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DocsToc } from "./docs-toc";
import { DocsTocMobileToggle } from "./docs-toc-mobile-toggle";

export function DocsTocWrapper() {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <>
      <DocsTocMobileToggle onClick={() => setTocOpen(true)} />
      <Sheet open={tocOpen} onOpenChange={setTocOpen}>
        <SheetContent side="right" className="w-[280px] sm:w-[340px]">
          <SheetHeader>
            <SheetTitle>Table of Contents</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <DocsToc />
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden w-[200px] shrink-0 xl:block">
        <div className="sticky top-6">
          <DocsToc />
        </div>
      </div>
    </>
  );
}
