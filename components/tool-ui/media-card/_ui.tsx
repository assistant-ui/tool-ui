/**
 * UI and utility re-exports for copy-standalone portability.
 *
 * This file centralizes dependencies so the component can be easily
 * copied to another project by updating these imports to match the target
 * project's paths.
 */
"use client";

import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
