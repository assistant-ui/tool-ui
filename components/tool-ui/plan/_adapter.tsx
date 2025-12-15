/**
 * Adapter: UI and utility re-exports for copy-standalone portability.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   cn          → Your Tailwind merge utility (e.g., "@/lib/utils", "~/lib/cn")
 *   Accordion   → shadcn/ui Accordion
 *   Card        → shadcn/ui Card
 *   Collapsible → shadcn/ui Collapsible
 */

export { cn } from "../../../lib/ui/cn";
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../ui/accordion";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../ui/card";
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../../ui/collapsible";
