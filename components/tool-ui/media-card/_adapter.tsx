/**
 * Adapter: UI and utility re-exports for copy-standalone portability.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   cn           → Your Tailwind merge utility (e.g., "@/lib/utils", "~/lib/cn")
 *   Card         → shadcn/ui Card
 *   Button       → shadcn/ui Button
 *   Badge        → shadcn/ui Badge
 *   DropdownMenu → shadcn/ui DropdownMenu
 *   Tooltip      → shadcn/ui Tooltip
 */
"use client";

export { cn } from "../../../lib/ui/cn";
export { Card, CardContent, CardFooter } from "../../ui/card";
export { Button } from "../../ui/button";
export { Badge } from "../../ui/badge";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
