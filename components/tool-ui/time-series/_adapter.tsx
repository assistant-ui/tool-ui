/**
 * Adapter: UI and utility re-exports for copy-standalone portability.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   cn    → Your Tailwind merge utility (e.g., "@/lib/utils", "~/lib/cn")
 *   Chart → shadcn/ui Chart (recharts wrapper)
 *   Card  → shadcn/ui Card
 */

export { cn } from "../../../lib/ui/cn";
export {
  ChartContainer,
  type ChartConfig,
} from "../../ui/chart";
export { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/card";
