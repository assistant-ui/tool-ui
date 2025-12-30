"use client";

import { Suspense } from "react";
import { WorkbenchShell } from "@/app/workbench/components/workbench-shell";

function WorkbenchLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-muted-foreground text-sm">Loading workbench...</div>
    </div>
  );
}

export default function WorkbenchPage() {
  return (
    <Suspense fallback={<WorkbenchLoading />}>
      <WorkbenchShell />
    </Suspense>
  );
}
