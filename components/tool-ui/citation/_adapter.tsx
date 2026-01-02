/**
 * Adapter: UI and utility re-exports for copy-standalone portability.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   cn      → Your Tailwind merge utility (e.g., "@/lib/utils", "~/lib/cn")
 *   Tooltip → shadcn/ui Tooltip (only needed for variant="inline")
 *   Popover → shadcn/ui Popover (only needed for CitationList)
 */
"use client";

export { cn } from "@/lib/ui/cn";
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
