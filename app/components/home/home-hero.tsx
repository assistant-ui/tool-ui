import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHypercube } from "./home-hypercube";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HomeHero() {
  return (
    <div className="flex flex-col gap-7">
      <div className="-mb-4 -ml-4 flex items-end justify-start">
        <HomeHypercube />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-6xl font-bold tracking-tight">Tool UI</h1>
            <Badge
              variant="outline"
              className="text-muted-foreground mt-1 text-sm"
            >
              Research preview
            </Badge>
          </div>
        </div>
        <h2 className="text-2xl text-pretty">
          Beautiful UI components for AI tool calls
        </h2>
      </div>
      <p className="text-muted-foreground mb-2 text-lg text-pretty">
        Responsive, accessible, typed, copy-pasteable. <br />
        Built on Radix, shadcn/ui, and Tailwind. Open Source.
        <br />
      </p>
      <Button asChild className="group" size="homeCTA">
        <Link href="/docs/gallery">
          See the Components
          <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
    </div>
  );
}
