"use client";

import { useState, useCallback } from "react";
import type { StructuredWidgetState } from "@/app/workbench/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/ui/cn";
import { Code, X, Plus } from "lucide-react";

interface StructuredWidgetStateEditorProps {
  value: StructuredWidgetState;
  onChange: (value: StructuredWidgetState) => void;
  onSwitchToRaw: () => void;
}

type TabId = "modelContent" | "privateContent" | "imageIds";

const TABS: { id: TabId; label: string; hint: string }[] = [
  {
    id: "modelContent",
    label: "Model Context",
    hint: "What the model sees in follow-up turns",
  },
  {
    id: "privateContent",
    label: "Private State",
    hint: "Widget-only data, not sent to model",
  },
  {
    id: "imageIds",
    label: "Image IDs",
    hint: "File IDs for images shown in the widget",
  },
];

export function StructuredWidgetStateEditor({
  value,
  onChange,
  onSwitchToRaw,
}: StructuredWidgetStateEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>("modelContent");

  const handleModelContentChange = useCallback(
    (content: string) => {
      onChange({
        ...value,
        modelContent: content || null,
      });
    },
    [value, onChange],
  );

  const handlePrivateContentChange = useCallback(
    (json: string) => {
      try {
        const parsed = json.trim() ? JSON.parse(json) : null;
        onChange({
          ...value,
          privateContent: parsed,
        });
      } catch {
        // Ignore parse errors while typing
      }
    },
    [value, onChange],
  );

  const handleAddImageId = useCallback(() => {
    const newId = `file-${crypto.randomUUID().slice(0, 8)}`;
    onChange({
      ...value,
      imageIds: [...value.imageIds, newId],
    });
  }, [value, onChange]);

  const handleRemoveImageId = useCallback(
    (index: number) => {
      onChange({
        ...value,
        imageIds: value.imageIds.filter((_, i) => i !== index),
      });
    },
    [value, onChange],
  );

  const handleImageIdChange = useCallback(
    (index: number, newId: string) => {
      onChange({
        ...value,
        imageIds: value.imageIds.map((id, i) => (i === index ? newId : id)),
      });
    },
    [value, onChange],
  );

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-[10px]"
          onClick={onSwitchToRaw}
        >
          <Code className="size-3" />
          Raw JSON
        </Button>
      </div>

      <div className="text-muted-foreground/60 text-[10px]">
        {activeTabData.hint}
      </div>

      {activeTab === "modelContent" && (
        <Textarea
          value={
            typeof value.modelContent === "string"
              ? value.modelContent
              : value.modelContent
                ? JSON.stringify(value.modelContent, null, 2)
                : ""
          }
          onChange={(e) => handleModelContentChange(e.target.value)}
          placeholder="Enter context for the model..."
          className="min-h-[80px] resize-none font-mono text-xs"
        />
      )}

      {activeTab === "privateContent" && (
        <Textarea
          value={
            value.privateContent
              ? JSON.stringify(value.privateContent, null, 2)
              : ""
          }
          onChange={(e) => handlePrivateContentChange(e.target.value)}
          placeholder="{}"
          className="min-h-[80px] resize-none font-mono text-xs"
        />
      )}

      {activeTab === "imageIds" && (
        <div className="space-y-2">
          {value.imageIds.length === 0 ? (
            <div className="text-muted-foreground py-2 text-center text-xs">
              No image IDs added
            </div>
          ) : (
            <div className="space-y-1">
              {value.imageIds.map((id, index) => (
                <div key={index} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => handleImageIdChange(index, e.target.value)}
                    className="bg-input/70 flex-1 rounded-md px-2 py-1 font-mono text-xs focus:outline-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive size-6"
                    onClick={() => handleRemoveImageId(index)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={handleAddImageId}
          >
            <Plus className="size-3" />
            Add Image ID
          </Button>
        </div>
      )}
    </div>
  );
}

export function createEmptyStructuredState(): StructuredWidgetState {
  return {
    modelContent: null,
    privateContent: null,
    imageIds: [],
  };
}
