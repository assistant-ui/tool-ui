/**
 * UI and utility re-exports for copy-standalone portability.
 *
 * This file centralizes dependencies so the component can be easily
 * copied to another project by updating these imports to match the target
 * project's paths.
 */
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../../ui/chart";
export { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/card";
