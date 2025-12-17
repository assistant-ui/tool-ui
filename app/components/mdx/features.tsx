import { cn } from "@/lib/ui/cn";
import type { LucideIcon } from "lucide-react";
import {
  Palette,
  Copy,
  Hash,
  Highlighter,
  FoldVertical,
  FileCode,
  Moon,
  BarChart3,
  LineChart,
  MousePointerClick,
  CircleCheck,
  CheckCircle2,
  ListChecks,
  Settings2,
  SquareCheck,
  Paintbrush,
  Terminal,
  Timer,
  AlertCircle,
  Code,
  FileOutput,
  Smartphone,
  ArrowUpDown,
  Table2,
  Accessibility,
  Link,
  Image,
  Video,
  Headphones,
  Download,
  Expand,
  PartyPopper,
  HelpCircle,
  Layers,
  Play,
  Eye,
  Maximize2,
  ListTodo,
  GalleryHorizontalEnd,
  Keyboard,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Palette,
  Copy,
  Hash,
  Highlighter,
  FoldVertical,
  FileCode,
  Moon,
  BarChart3,
  LineChart,
  MousePointerClick,
  CircleCheck,
  CheckCircle2,
  ListChecks,
  Settings2,
  SquareCheck,
  Paintbrush,
  Terminal,
  Timer,
  AlertCircle,
  Code,
  FileOutput,
  Smartphone,
  ArrowUpDown,
  Table2,
  Accessibility,
  Link,
  Image,
  Video,
  Headphones,
  Download,
  Expand,
  PartyPopper,
  HelpCircle,
  Layers,
  Play,
  Eye,
  Maximize2,
  ListTodo,
  GalleryHorizontalEnd,
  Keyboard,
};

interface FeatureGridProps {
  children: React.ReactNode;
  className?: string;
}

export function FeatureGrid({ children, className }: FeatureGridProps) {
  return (
    <div
      className={cn(
        "not-prose my-6 grid grid-cols-1 gap-4 sm:grid-cols-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface FeatureProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Feature({ icon, title, children, className }: FeatureProps) {
  const IconComponent = ICON_MAP[icon] ?? HelpCircle;

  return (
    <div
      className={cn(
        "border-border/50 bg-muted/50 flex flex-col justify-between gap-3 rounded-xl border p-4",
        className,
      )}
    >
      <IconComponent className="text-muted-foreground h-5 w-5" />
      <div>
        <div className="leading-none font-semibold text-pretty">{title}</div>
        <div className="text-muted-foreground mt-1.5 text-sm text-pretty">
          {children}
        </div>
      </div>
    </div>
  );
}
