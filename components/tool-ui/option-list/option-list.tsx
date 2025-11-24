"use client";

import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  Fragment,
} from "react";
import type {
  OptionListProps,
  OptionListSelection,
  OptionListOption,
} from "./schema";
import { Button, Separator } from "./_ui";
import { cn } from "./_cn";
import { Check } from "lucide-react";

function normalizeToSet(
  value: OptionListSelection | undefined,
  mode: "multi" | "single",
  maxSelections?: number,
): Set<string> {
  if (mode === "single") {
    const single =
      typeof value === "string"
        ? value
        : Array.isArray(value)
          ? value[0]
          : null;
    return single ? new Set([single]) : new Set();
  }

  const arr =
    typeof value === "string"
      ? [value]
      : Array.isArray(value)
        ? value
        : [];

  return new Set(maxSelections ? arr.slice(0, maxSelections) : arr);
}

function setToSelection(
  selected: Set<string>,
  mode: "multi" | "single",
): OptionListSelection {
  if (mode === "single") {
    const [first] = selected;
    return first ?? null;
  }
  return Array.from(selected);
}

function areSetsEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const val of a) {
    if (!b.has(val)) return false;
  }
  return true;
}

export function OptionList({
  options,
  selectionMode = "multi",
  align = "right",
  layout = "inline",
  confirmLabel = "Confirm",
  cancelLabel = "Clear",
  minSelections = 1,
  maxSelections,
  value,
  defaultValue,
  onChange,
  onConfirm,
  onCancel,
  className,
}: OptionListProps) {
  const effectiveMaxSelections = selectionMode === "single" ? 1 : maxSelections;

  const [uncontrolledSelected, setUncontrolledSelected] = useState<Set<string>>(
    () => normalizeToSet(defaultValue, selectionMode, effectiveMaxSelections),
  );

  useEffect(() => {
    setUncontrolledSelected((prev) =>
      normalizeToSet(Array.from(prev), selectionMode, effectiveMaxSelections),
    );
  }, [selectionMode, effectiveMaxSelections]);

  const selectedIds = useMemo(
    () =>
      value !== undefined
        ? normalizeToSet(value, selectionMode, effectiveMaxSelections)
        : uncontrolledSelected,
    [value, uncontrolledSelected, selectionMode, effectiveMaxSelections],
  );

  const selectedCount = selectedIds.size;
  const [isExecuting, setIsExecuting] = useState(false);

  const updateSelection = useCallback(
    (next: Set<string>) => {
      const normalizedNext = normalizeToSet(
        Array.from(next),
        selectionMode,
        effectiveMaxSelections,
      );

      if (value === undefined) {
        if (!areSetsEqual(uncontrolledSelected, normalizedNext)) {
          setUncontrolledSelected(normalizedNext);
        }
      }

      onChange?.(setToSelection(normalizedNext, selectionMode));
    },
    [
      effectiveMaxSelections,
      selectionMode,
      uncontrolledSelected,
      value,
      onChange,
    ],
  );

  const toggleSelection = useCallback(
    (optionId: string) => {
      const next = new Set(selectedIds);
      const isSelected = next.has(optionId);

      if (selectionMode === "single") {
        if (isSelected) {
          next.delete(optionId);
        } else {
          next.clear();
          next.add(optionId);
        }
      } else {
        if (isSelected) {
          next.delete(optionId);
        } else {
          if (
            effectiveMaxSelections &&
            next.size >= effectiveMaxSelections
          ) {
            return;
          }
          next.add(optionId);
        }
      }

      updateSelection(next);
    },
    [effectiveMaxSelections, selectedIds, selectionMode, updateSelection],
  );

  const handleConfirm = useCallback(async () => {
    if (!onConfirm || isExecuting) return;

    if (selectedCount === 0 || selectedCount < minSelections) return;

    try {
      setIsExecuting(true);
      await onConfirm(setToSelection(selectedIds, selectionMode));
    } finally {
      setIsExecuting(false);
    }
  }, [
    isExecuting,
    minSelections,
    onConfirm,
    selectedCount,
    selectedIds,
    selectionMode,
  ]);

  const handleCancel = useCallback(() => {
    const empty = new Set<string>();
    updateSelection(empty);
    onCancel?.();
  }, [onCancel, updateSelection]);

  const alignClassButtons = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  const actionsContainerLayout =
    layout === "stack"
      ? "flex-col"
      : cn(
          "flex-col",
          "@[28rem]:flex-row @[28rem]:flex-wrap @[28rem]:divide-y @[28rem]:divide-x @[28rem]:divide-border",
          align === "left" && "@[28rem]:justify-start",
          align === "center" && "@[28rem]:justify-center",
          align === "right" && "@[28rem]:justify-end",
        );

  const isConfirmDisabled =
    isExecuting || selectedCount < minSelections || selectedCount === 0;
  const isCancelDisabled = isExecuting || selectedCount === 0;

  const indicatorShape =
    selectionMode === "single" ? "rounded-full" : "rounded";

  const renderIndicator = (option: OptionListOption, isSelected: boolean) => (
    <div
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center border-2 transition-colors",
        indicatorShape,
        isSelected &&
          "border-primary bg-primary text-primary-foreground",
        !isSelected && "border-muted-foreground/50",
        option.disabled && "opacity-50",
      )}
    >
      {selectionMode === "multi" && isSelected && (
        <Check className="h-3 w-3" />
      )}
      {selectionMode === "single" && isSelected && (
        <span className="h-2 w-2 rounded-full bg-current" />
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        "text-foreground",
        className,
      )}
      data-slot="option-list"
      role="group"
      aria-label="Option list"
    >
      <div
        className={cn(
          "group/list bg-card/60 flex w-full overflow-hidden rounded-2xl border px-5 py-2.5 shadow-xs",
          actionsContainerLayout,
        )}
        role="listbox"
        aria-multiselectable={selectionMode === "multi"}
      >
        {options.map((option, index) => {
          const isSelected = selectedIds.has(option.id);
          const isSelectionLocked =
            selectionMode === "multi" &&
            effectiveMaxSelections !== undefined &&
            selectedCount >= effectiveMaxSelections &&
            !isSelected;
          const isDisabled =
            option.disabled || isExecuting || isSelectionLocked;

          return (
            <Fragment key={option.id}>
              {index > 0 && (
                <Separator
                  className={cn(
                    "[&:has(+_:hover)]:opacity-0 [.peer:hover+&]:opacity-0",
                    {
                      "@[28rem]:hidden": layout === "inline",
                    },
                  )}
                  orientation={layout === "stack" ? "horizontal" : "vertical"}
                />
              )}
              <Button
                data-id={option.id}
                variant="ghost"
                size="sm"
                role="option"
                aria-selected={isSelected}
                onClick={() => toggleSelection(option.id)}
                disabled={isDisabled}
                className={cn(
                  "peer group relative min-h-[44px] w-full justify-start text-left text-sm font-medium",
                  "rounded-none border-0 bg-transparent px-0 text-base shadow-none transition-none hover:bg-transparent! @[28rem]:text-sm",
                  { "@[28rem]:min-w-48 @[28rem]:flex-1": layout !== "stack" },
                )}
              >
                <span
                  className={cn(
                    "bg-accent/60 group-active:bg-accent/80 absolute inset-0 -mx-3 -my-0.5 rounded-lg opacity-0 group-hover:opacity-100",
                  )}
                />
                <div className="relative flex items-center gap-3">
                  {renderIndicator(option, isSelected)}
                  {option.icon && <span>{option.icon}</span>}
                  <div className="flex flex-col text-left">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-muted-foreground mt-0.5 text-sm font-normal">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
              </Button>
            </Fragment>
          );
        })}
      </div>

      <div className={cn("flex items-center gap-4", alignClassButtons)}>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleCancel}
          disabled={isCancelDisabled}
          className="text-base @[28rem]:px-3 @[28rem]:py-2 @[28rem]:text-sm"
        >
          {cancelLabel}
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          className="text-base @[28rem]:px-3 @[28rem]:py-2 @[28rem]:text-sm"
        >
          {isExecuting ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {confirmLabel}
            </>
          ) : (
            <>
              {confirmLabel}
              {selectionMode === "multi" && selectedCount > 0 && (
                <span>{selectedCount}</span>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
