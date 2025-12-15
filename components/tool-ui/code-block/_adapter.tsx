/**
 * UI and utility re-exports for copy-standalone portability.
 *
 * This file centralizes dependencies so the component can be easily
 * copied to another project by updating these imports to match the target
 * project's paths.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { Button } from "../../ui/button";
export { Collapsible, CollapsibleTrigger } from "../../ui/collapsible";
