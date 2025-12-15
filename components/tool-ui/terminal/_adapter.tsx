/**
 * Adapter: UI and utility re-exports for copy-standalone portability.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   cn          → Your Tailwind merge utility (e.g., "@/lib/utils", "~/lib/cn")
 *   Button      → shadcn/ui Button
 *   Badge       → shadcn/ui Badge
 *   Collapsible → shadcn/ui Collapsible
 */

export { cn } from "../../../lib/ui/cn";
export { Button } from "../../ui/button";
export { Badge } from "../../ui/badge";
export { Collapsible, CollapsibleTrigger } from "../../ui/collapsible";
