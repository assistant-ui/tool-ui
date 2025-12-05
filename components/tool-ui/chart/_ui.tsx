/**
 * UI component re-exports for copy-standalone portability.
 *
 * This file centralizes UI dependencies so the component can be easily
 * copied to another project by updating these imports to match the target
 * project's component library paths.
 */
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../../ui/chart";
export { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/card";
