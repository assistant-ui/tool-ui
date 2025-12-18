"use client";

import { useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWorkbenchStore, useMockConfig } from "@/app/workbench/lib/store";
import type { MockVariant } from "@/app/workbench/lib/mock-config";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { COMPACT_LABEL_CLASSES } from "./styles";
import { MockVariantList } from "./mock-variant-list";
import { MockVariantEditor } from "./mock-variant-editor";

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border/50 rounded-lg border">
      <button
        type="button"
        onClick={onToggle}
        className="hover:bg-muted/50 flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium"
      >
        {title}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function AnnotationToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <div>
        <div className="text-xs font-medium">{label}</div>
        <div className="text-muted-foreground text-[10px]">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export function MockConfigPanel() {
  const mockConfig = useMockConfig();
  const toolNames = Object.keys(mockConfig.tools);

  const {
    setMocksEnabled,
    registerTool,
    removeTool,
    setActiveVariant,
    addVariant,
    updateVariant,
    removeVariant,
    setToolAnnotations,
    setToolSchemas,
  } = useWorkbenchStore(
    useShallow((s) => ({
      setMocksEnabled: s.setMocksEnabled,
      registerTool: s.registerTool,
      removeTool: s.removeTool,
      setActiveVariant: s.setActiveVariant,
      addVariant: s.addVariant,
      updateVariant: s.updateVariant,
      removeVariant: s.removeVariant,
      setToolAnnotations: s.setToolAnnotations,
      setToolSchemas: s.setToolSchemas,
    })),
  );

  const [selectedTool, setSelectedTool] = useState<string | null>(
    toolNames[0] ?? null,
  );
  const [editingVariant, setEditingVariant] = useState<MockVariant | null>(null);
  const [newToolName, setNewToolName] = useState("");
  const [showAddTool, setShowAddTool] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const toolConfig = selectedTool ? mockConfig.tools[selectedTool] : null;

  const handleAddTool = useCallback(() => {
    const name = newToolName.trim();
    if (name && !mockConfig.tools[name]) {
      registerTool(name);
      setSelectedTool(name);
      setNewToolName("");
      setShowAddTool(false);
    }
  }, [newToolName, mockConfig.tools, registerTool]);

  const handleDeleteTool = useCallback(() => {
    if (!selectedTool) return;
    removeTool(selectedTool);
    const remaining = Object.keys(mockConfig.tools).filter(
      (n) => n !== selectedTool,
    );
    setSelectedTool(remaining[0] ?? null);
  }, [selectedTool, mockConfig.tools, removeTool]);

  const handleAddVariant = useCallback(() => {
    if (!selectedTool) return;
    const newVariant: MockVariant = {
      id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: "custom",
      type: "custom",
      delay: 300,
      response: {
        structuredContent: {},
      },
    };
    addVariant(selectedTool, newVariant);
    setEditingVariant(newVariant);
  }, [selectedTool, addVariant]);

  const handleSaveVariant = useCallback(
    (variant: MockVariant) => {
      if (!selectedTool) return;
      updateVariant(selectedTool, variant.id, variant);
      setEditingVariant(null);
    },
    [selectedTool, updateVariant],
  );

  const handleDeleteVariant = useCallback(
    (variantId: string) => {
      if (!selectedTool) return;
      removeVariant(selectedTool, variantId);
      if (editingVariant?.id === variantId) {
        setEditingVariant(null);
      }
    },
    [selectedTool, removeVariant, editingVariant],
  );

  if (toolNames.length === 0 && !showAddTool) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-muted-foreground text-sm">
          No tools registered yet.
        </div>
        <div className="text-muted-foreground text-xs">
          Tools are auto-registered when callTool() is invoked, or you can add
          one manually.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddTool(true)}
          className="mt-2"
        >
          <Plus className="mr-1.5 size-3.5" />
          Add Tool
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={mockConfig.globalEnabled}
            onCheckedChange={setMocksEnabled}
          />
          Simulation Mode
        </label>
      </div>

      <div className="flex items-center gap-2">
        {showAddTool ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={newToolName}
              onChange={(e) => setNewToolName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTool()}
              placeholder="tool_name"
              className="bg-input/70 flex-1 rounded-md px-2 py-1.5 text-sm focus:outline-none"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={handleAddTool}>
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddTool(false);
                setNewToolName("");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <Select
              value={selectedTool ?? ""}
              onValueChange={setSelectedTool}
            >
              <SelectTrigger className="h-8 flex-1 text-xs">
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent>
                {toolNames.map((name) => (
                  <SelectItem key={name} value={name} className="text-xs">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setShowAddTool(true)}
            >
              <Plus className="size-4" />
            </Button>
            {selectedTool && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive size-8"
                onClick={handleDeleteTool}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </>
        )}
      </div>

      {toolConfig && (
        <>
          <div className="flex-1 space-y-4 overflow-auto">
            <div>
              <div className={cn(COMPACT_LABEL_CLASSES, "mb-2")}>
                Active Scenario
              </div>
              <MockVariantList
                variants={toolConfig.variants}
                activeVariantId={toolConfig.activeVariantId}
                onSelectVariant={(id) => setActiveVariant(selectedTool!, id)}
                onEditVariant={setEditingVariant}
                onDeleteVariant={handleDeleteVariant}
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={handleAddVariant}
              >
                <Plus className="mr-1 size-3" />
                Add Scenario
              </Button>
            </div>

            <CollapsibleSection
              title="Annotations"
              expanded={expandedSections.annotations}
              onToggle={() => toggleSection("annotations")}
            >
              <div className="space-y-2">
                <AnnotationToggle
                  label="Read Only"
                  hint="Indicates tool doesn't modify state"
                  checked={toolConfig.annotations?.readOnlyHint ?? false}
                  onChange={(checked) =>
                    setToolAnnotations(selectedTool!, {
                      ...toolConfig.annotations,
                      readOnlyHint: checked,
                    })
                  }
                />
                <AnnotationToggle
                  label="Destructive"
                  hint="Indicates tool may delete data"
                  checked={toolConfig.annotations?.destructiveHint ?? false}
                  onChange={(checked) =>
                    setToolAnnotations(selectedTool!, {
                      ...toolConfig.annotations,
                      destructiveHint: checked,
                    })
                  }
                />
                <AnnotationToggle
                  label="Open World"
                  hint="Indicates tool accesses external resources"
                  checked={toolConfig.annotations?.openWorldHint ?? false}
                  onChange={(checked) =>
                    setToolAnnotations(selectedTool!, {
                      ...toolConfig.annotations,
                      openWorldHint: checked,
                    })
                  }
                />
                <AnnotationToggle
                  label="Idempotent"
                  hint="Indicates repeated calls produce same result"
                  checked={toolConfig.annotations?.idempotentHint ?? false}
                  onChange={(checked) =>
                    setToolAnnotations(selectedTool!, {
                      ...toolConfig.annotations,
                      idempotentHint: checked,
                    })
                  }
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Schemas"
              expanded={expandedSections.schemas}
              onToggle={() => toggleSection("schemas")}
            >
              <div className="space-y-3">
                <div>
                  <div className="text-muted-foreground mb-1 text-xs">
                    Input Schema (JSON)
                  </div>
                  <textarea
                    className="bg-input/70 w-full rounded-md p-2 font-mono text-xs"
                    rows={3}
                    placeholder="{}"
                    value={
                      toolConfig.schemas?.inputSchema
                        ? JSON.stringify(toolConfig.schemas.inputSchema, null, 2)
                        : ""
                    }
                    onChange={(e) => {
                      try {
                        const parsed = e.target.value
                          ? JSON.parse(e.target.value)
                          : undefined;
                        setToolSchemas(selectedTool!, {
                          ...toolConfig.schemas,
                          inputSchema: parsed,
                        });
                      } catch {
                        // Ignore parse errors while typing
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs">
                    Output Schema (JSON)
                  </div>
                  <textarea
                    className="bg-input/70 w-full rounded-md p-2 font-mono text-xs"
                    rows={3}
                    placeholder="{}"
                    value={
                      toolConfig.schemas?.outputSchema
                        ? JSON.stringify(
                            toolConfig.schemas.outputSchema,
                            null,
                            2,
                          )
                        : ""
                    }
                    onChange={(e) => {
                      try {
                        const parsed = e.target.value
                          ? JSON.parse(e.target.value)
                          : undefined;
                        setToolSchemas(selectedTool!, {
                          ...toolConfig.schemas,
                          outputSchema: parsed,
                        });
                      } catch {
                        // Ignore parse errors while typing
                      }
                    }}
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {editingVariant && (
            <MockVariantEditor
              variant={editingVariant}
              onSave={handleSaveVariant}
              onCancel={() => setEditingVariant(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
