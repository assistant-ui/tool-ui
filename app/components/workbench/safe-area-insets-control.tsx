"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import type { SafeAreaInsets } from "@/lib/workbench/types";
import {
  CONTROL_BG_CLASSES,
  INPUT_GROUP_CLASSES,
  INPUT_CLASSES,
  COMPACT_ADDON_CLASSES,
  COMPACT_LABEL_CLASSES,
  LABEL_CLASSES,
} from "./styles";

const INSET_KEYS = [
  { key: "left" as const, symbol: "←", label: "Left" },
  { key: "top" as const, symbol: "↑", label: "Top" },
  { key: "right" as const, symbol: "→", label: "Right" },
  { key: "bottom" as const, symbol: "↓", label: "Bottom" },
] as const;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

interface SafeAreaInsetsControlProps {
  value: SafeAreaInsets;
  onChange: (next: Partial<SafeAreaInsets>) => void;
}

export function SafeAreaInsetsControl({
  value,
  onChange,
}: SafeAreaInsetsControlProps) {
  const [open, setOpen] = useState(false);
  const [customizeSides, setCustomizeSides] = useState(false);
  const [allInputValue, setAllInputValue] = useState("");

  const { top, bottom, left, right } = value;
  const isUniform = top === bottom && top === left && top === right;

  useEffect(() => {
    if (isUniform) {
      setAllInputValue(String(top));
    } else {
      setAllInputValue("");
    }
  }, [isUniform, top]);

  useEffect(() => {
    if (!isUniform && !customizeSides) {
      setCustomizeSides(true);
    }
  }, [isUniform, customizeSides]);

  const handleAllChange = (inputValue: string) => {
    setAllInputValue(inputValue);
    const parsed = Number(inputValue);
    if (Number.isFinite(parsed)) {
      const clamped = clamp(parsed, 0, 100);
      onChange({
        top: clamped,
        bottom: clamped,
        left: clamped,
        right: clamped,
      });
    }
  };

  const handleSideChange = (side: keyof SafeAreaInsets, inputValue: string) => {
    const parsed = Number(inputValue);
    const clamped = clamp(parsed, 0, 100);
    onChange({ [side]: clamped });
  };

  const handleReset = () => {
    onChange({ top: 0, bottom: 0, left: 0, right: 0 });
    setAllInputValue("0");
    setCustomizeSides(false);
  };

  const summaryItems = [
    { label: "L", value: left },
    { label: "T", value: top },
    { label: "R", value: right },
    { label: "B", value: bottom },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`${CONTROL_BG_CLASSES} flex h-7 items-center gap-2 rounded-md px-2 text-xs select-none`}
          aria-label="Edit safe area insets"
        >
          <span className="tabular-nums">
            {summaryItems.map((item, i) => (
              <span key={item.label}>
                <span className="px-1">{item.value}</span>
                {i < summaryItems.length - 1 && (
                  <span className="text-muted-foreground/30"> / </span>
                )}
              </span>
            ))}
          </span>
          <ChevronDown className="text-muted-foreground size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Safe area insets</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 gap-1 px-2 text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Label className={`${COMPACT_LABEL_CLASSES} w-12 shrink-0`}>
            All sides
          </Label>
          <InputGroup className={`${INPUT_GROUP_CLASSES} w-20`}>
            <InputGroupInput
              type="number"
              value={allInputValue}
              placeholder={isUniform ? undefined : "mixed"}
              onChange={(e) => handleAllChange(e.target.value)}
              min={0}
              max={100}
              className={INPUT_CLASSES}
              aria-label="All insets"
            />
            <InputGroupAddon
              align="inline-end"
              className={COMPACT_ADDON_CLASSES}
            >
              px
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="customize-sides" className={LABEL_CLASSES}>
            Customize sides
          </Label>
          <Switch
            id="customize-sides"
            checked={customizeSides}
            onCheckedChange={setCustomizeSides}
          />
        </div>

        {customizeSides && (
          <div className="grid w-fit grid-cols-2 gap-2">
            {INSET_KEYS.map(({ key, symbol, label }) => (
              <InputGroup key={key} className={INPUT_GROUP_CLASSES}>
                <InputGroupAddon className={COMPACT_ADDON_CLASSES}>
                  <InputGroupText>{symbol}</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  value={value[key]}
                  onChange={(e) => handleSideChange(key, e.target.value)}
                  min={0}
                  max={100}
                  aria-label={`${label} inset`}
                  className={`${INPUT_CLASSES} w-full`}
                />
              </InputGroup>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
