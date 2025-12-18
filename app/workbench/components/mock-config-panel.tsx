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
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { COMPACT_LABEL_CLASSES } from "./styles";
import { MockVariantList } from "./mock-variant-list";
import { MockVariantEditor } from "./mock-variant-editor";

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
  } = useWorkbenchStore(
    useShallow((s) => ({
      setMocksEnabled: s.setMocksEnabled,
      registerTool: s.registerTool,
      removeTool: s.removeTool,
      setActiveVariant: s.setActiveVariant,
      addVariant: s.addVariant,
      updateVariant: s.updateVariant,
      removeVariant: s.removeVariant,
    })),
  );

  const [selectedTool, setSelectedTool] = useState<string | null>(
    toolNames[0] ?? null,
  );
  const [editingVariant, setEditingVariant] = useState<MockVariant | null>(null);
  const [newToolName, setNewToolName] = useState("");
  const [showAddTool, setShowAddTool] = useState(false);

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
          Mocks Enabled
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
          <div className="flex-1 overflow-auto">
            <div className={cn(COMPACT_LABEL_CLASSES, "mb-2")}>
              Active Response
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
              Add Variant
            </Button>
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
