/**
 * Adapter: UI and utility re-exports for copy-standalone portability.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   cn           → Your Tailwind merge utility (e.g., "@/lib/utils", "~/lib/cn")
 *   Button       → shadcn/ui Button
 *   Switch       → shadcn/ui Switch
 *   ToggleGroup  → shadcn/ui ToggleGroup
 *   Select       → shadcn/ui Select
 *   Separator    → shadcn/ui Separator
 *   Label        → shadcn/ui Label
 */

export { cn } from "../../../lib/ui/cn";
export { Button } from "../../ui/button";
export { Switch } from "../../ui/switch";
export {
  ToggleGroup,
  ToggleGroupItem,
} from "../../ui/toggle-group";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
export { Separator } from "../../ui/separator";
export { Label } from "../../ui/label";
