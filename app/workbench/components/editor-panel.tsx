"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useWorkbenchStore,
  useSelectedComponent,
} from "@/app/workbench/lib/store";
import {
  isStructuredWidgetState,
  type StructuredWidgetState,
} from "@/app/workbench/lib/types";
import { getComponent } from "@/app/workbench/lib/component-registry";
import {
  StructuredWidgetStateEditor,
  createEmptyStructuredState,
} from "./structured-widget-state-editor";
import { JsonEditor } from "./json-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";
import { RotateCcw, ChevronDown } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type JsonEditorTab =
  | "toolInput"
  | "toolOutput"
  | "widgetState"
  | "toolResponseMetadata";

type EditorSectionKey = "toolInput" | "widgetState" | "toolResponseMetadata";

interface EditorSectionConfig {
  key: EditorSectionKey;
  title: string;
  tooltip: string;
  tab: JsonEditorTab;
}

const EDITOR_SECTIONS: EditorSectionConfig[] = [
  {
    key: "toolInput",
    title: "Tool Input",
    tooltip:
      "Data passed to your widget when a tool is called. Edit to test different inputs.",
    tab: "toolInput",
  },
  {
    key: "widgetState",
    title: "Widget State",
    tooltip:
      "State your widget persists between interactions. Restored when the widget reopens.",
    tab: "widgetState",
  },
  {
    key: "toolResponseMetadata",
    title: "Private Metadata",
    tooltip:
      "Data only your widget sees. Hidden from the model and not included in responses.",
    tab: "toolResponseMetadata",
  },
];

function useJsonEditorState() {
  const selectedComponent = useSelectedComponent();

  const {
    toolInput,
    toolOutput,
    widgetState,
    toolResponseMetadata,
    setToolInput,
    setToolOutput,
    setWidgetState,
    setToolResponseMetadata,
  } = useWorkbenchStore(
    useShallow((s) => ({
      toolInput: s.toolInput,
      toolOutput: s.toolOutput,
      widgetState: s.widgetState,
      toolResponseMetadata: s.toolResponseMetadata,
      setToolInput: s.setToolInput,
      setToolOutput: s.setToolOutput,
      setWidgetState: s.setWidgetState,
      setToolResponseMetadata: s.setToolResponseMetadata,
    })),
  );

  const getActiveData = useCallback(
    (tab: JsonEditorTab): Record<string, unknown> => {
      switch (tab) {
        case "toolInput":
          return toolInput;
        case "toolOutput":
          return toolOutput ?? {};
        case "widgetState":
          return (widgetState as Record<string, unknown>) ?? {};
        case "toolResponseMetadata":
          return toolResponseMetadata ?? {};
        default:
          return {};
      }
    },
    [toolInput, toolOutput, widgetState, toolResponseMetadata],
  );

  const handleChange = useCallback(
    (tab: JsonEditorTab, value: Record<string, unknown>) => {
      const isEmpty = Object.keys(value).length === 0;

      switch (tab) {
        case "toolInput":
          setToolInput(value);
          break;
        case "toolOutput":
          setToolOutput(isEmpty ? null : value);
          break;
        case "widgetState":
          setWidgetState(isEmpty ? null : value);
          break;
        case "toolResponseMetadata":
          setToolResponseMetadata(isEmpty ? null : value);
          break;
      }
    },
    [setToolInput, setToolOutput, setWidgetState, setToolResponseMetadata],
  );

  const handleReset = useCallback(
    (tab: JsonEditorTab) => {
      switch (tab) {
        case "toolInput": {
          const component = getComponent(selectedComponent);
          setToolInput(component?.defaultProps ?? {});
          break;
        }
        case "toolOutput":
          setToolOutput(null);
          break;
        case "widgetState":
          setWidgetState(null);
          break;
        case "toolResponseMetadata":
          setToolResponseMetadata(null);
          break;
      }
    },
    [
      selectedComponent,
      setToolInput,
      setToolOutput,
      setWidgetState,
      setToolResponseMetadata,
    ],
  );

  return { getActiveData, handleChange, handleReset };
}

interface EditorSectionTriggerProps {
  title: string;
  tooltip?: string;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionTooltip?: string;
  showAction?: boolean;
}

function EditorSectionTrigger({
  title,
  badge,
  isOpen,
  onToggle,
  onAction,
  actionIcon,
  actionTooltip,
  showAction = isOpen,
}: EditorSectionTriggerProps) {
  return (
    <div className="hover:bg-muted/30 flex h-10 shrink-0 items-center justify-between gap-2 px-3 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-full flex-1 items-center gap-1.5 text-left"
      >
        <ChevronDown
          className={cn(
            "text-muted-foreground/60 size-3.5 shrink-0 transition-transform duration-100 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isOpen ? "rotate-0" : "-rotate-90",
          )}
        />
        <span className="text-muted-foreground mr-1 text-sm font-normal">
          {title}
        </span>

        {badge}
      </button>
      {showAction && onAction && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
            >
              {actionIcon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{actionTooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

interface EditorSectionContentProps {
  isOpen: boolean;
  children: ReactNode;
}

function EditorSectionContent({ isOpen, children }: EditorSectionContentProps) {
  if (!isOpen) {
    return <div className="border-border/40 border-b" />;
  }

  return (
    <div className="border-border/40 scrollbar-subtle min-h-0 flex-1 overflow-y-auto border-b">
      {children}
    </div>
  );
}

interface WidgetStateSectionProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

function WidgetStateSection({ value, onChange }: WidgetStateSectionProps) {
  const [preferRawMode, setPreferRawMode] = useState(false);
  const isStructured = isStructuredWidgetState(value);
  const showStructured = isStructured && !preferRawMode;

  const handleStructuredChange = useCallback(
    (structured: StructuredWidgetState) => {
      onChange(structured as unknown as Record<string, unknown>);
    },
    [onChange],
  );

  const handleConvertToStructured = useCallback(() => {
    const structured = createEmptyStructuredState();
    onChange(structured as unknown as Record<string, unknown>);
    setPreferRawMode(false);
  }, [onChange]);

  const handleSwitchToRaw = useCallback(() => {
    setPreferRawMode(true);
  }, []);

  if (showStructured) {
    return (
      <StructuredWidgetStateEditor
        value={value as unknown as StructuredWidgetState}
        onChange={handleStructuredChange}
        onSwitchToRaw={handleSwitchToRaw}
      />
    );
  }

  const hasData = Object.keys(value).length > 0;

  return (
    <div className="flex flex-col gap-2">
      <JsonEditor label="Widget State" value={value} onChange={onChange} />
      {!isStructured && hasData && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-6 gap-1 self-start text-[10px]"
          onClick={handleConvertToStructured}
        >
          Convert to structured
        </Button>
      )}
      {!hasData && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-6 gap-1 self-start text-[10px]"
          onClick={handleConvertToStructured}
        >
          Use structured format
        </Button>
      )}
      {isStructured && preferRawMode && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-6 gap-1 self-start text-[10px]"
          onClick={() => setPreferRawMode(false)}
        >
          Switch to structured view
        </Button>
      )}
    </div>
  );
}

export function EditorPanel() {
  const { getActiveData, handleChange, handleReset } = useJsonEditorState();
  const [openSections, setOpenSections] = useState<
    Record<EditorSectionKey, boolean>
  >({
    toolInput: true,
    widgetState: false,
    toolResponseMetadata: false,
  });

  const toggleSection = (key: EditorSectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSectionContent = (section: EditorSectionConfig) => {
    if (section.key === "widgetState") {
      return (
        <WidgetStateSection
          value={getActiveData(section.tab)}
          onChange={(value) => handleChange(section.tab, value)}
        />
      );
    }
    return (
      <JsonEditor
        label={section.title}
        value={getActiveData(section.tab)}
        onChange={(value) => handleChange(section.tab, value)}
      />
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden pt-6 pb-8">
      {EDITOR_SECTIONS.map((section) => (
        <div key={section.key} className="contents">
          <EditorSectionTrigger
            title={section.title}
            tooltip={section.tooltip}
            isOpen={openSections[section.key]}
            onToggle={() => toggleSection(section.key)}
            onAction={() => handleReset(section.tab)}
            actionIcon={<RotateCcw className="size-3" />}
            actionTooltip="Reset"
          />
          <EditorSectionContent isOpen={openSections[section.key]}>
            {renderSectionContent(section)}
          </EditorSectionContent>
        </div>
      ))}
    </div>
  );
}
