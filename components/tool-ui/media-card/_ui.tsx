/**
 * UI component re-exports for copy-standalone portability.
 *
 * This file centralizes UI dependencies so the component can be easily
 * copied to another project by updating these imports to match the target
 * project's component library paths.
 */
"use client";

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
