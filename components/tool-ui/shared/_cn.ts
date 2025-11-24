/**
 * Utility re-export for copy-standalone portability.
 *
 * This file centralizes the cn() utility so the component can be easily
 * copied to another project by updating this to use the target project's
 * utility path (e.g., "@/lib/utils").
 */
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
