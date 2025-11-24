"use client";

import { useMemo, useState, useCallback, useEffect, Fragment } from "react";
import type {
  OptionListProps,
  OptionListSelection,
  OptionListOption,
} from "./schema";
import { useActionButtons, normalizeActionsConfig } from "../shared";
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
    typeof value === "string" ? [value] : Array.isArray(value) ? value : [];

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
  minSelections = 1,
  maxSelections,
  value,
  defaultValue,
  onChange,
  onConfirm,
  onCancel,
  footerActions,
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
          if (effectiveMaxSelections && next.size >= effectiveMaxSelections) {
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
    if (!onConfirm) return;
    if (selectedCount === 0 || selectedCount < minSelections) return;
    await onConfirm(setToSelection(selectedIds, selectionMode));
  }, [minSelections, onConfirm, selectedCount, selectedIds, selectionMode]);

  const handleCancel = useCallback(() => {
    const empty = new Set<string>();
    updateSelection(empty);
    onCancel?.();
  }, [onCancel, updateSelection]);

  const normalizedFooterActions = useMemo(() => {
    const normalized = normalizeActionsConfig(footerActions);
    if (normalized) return normalized;
    return {
      items: [
        { id: "cancel", label: "Clear", variant: "ghost" as const },
        { id: "confirm", label: "Confirm", variant: "default" as const },
      ],
      align: "right" as const,
      layout: "inline" as const,
    } satisfies ReturnType<typeof normalizeActionsConfig>;
  }, [footerActions]);

  const { actions: resolvedFooterActions, runAction } = useActionButtons({
    actions: normalizedFooterActions.items,
    onBeforeAction: (id) => {
      if (id === "confirm") {
        return selectedCount >= minSelections && selectedCount > 0;
      }
      if (id === "cancel") {
        return selectedCount > 0;
      }
      return true;
    },
    onAction: async (id) => {
      if (id === "confirm") {
        await handleConfirm();
      } else if (id === "cancel") {
        handleCancel();
      }
    },
    confirmTimeout: normalizedFooterActions.confirmTimeout,
  });

  const isConfirmDisabled =
    selectedCount < minSelections || selectedCount === 0;
  const isCancelDisabled = selectedCount === 0;

  const indicatorShape =
    selectionMode === "single" ? "rounded-full" : "rounded";

  const renderIndicator = (option: OptionListOption, isSelected: boolean) => (
    <div
      className={cn(
        "flex size-4 shrink-0 items-center justify-center border-2 transition-colors",
        indicatorShape,
        isSelected && "border-primary bg-primary text-primary-foreground",
        !isSelected && "border-muted-foreground/50",
        option.disabled && "opacity-50",
      )}
    >
      {selectionMode === "multi" && isSelected && <Check className="size-3" />}
      {selectionMode === "single" && isSelected && (
        <span className="size-2 rounded-full bg-current" />
      )}
    </div>
  );

  return (
    <div
      className={cn("flex flex-col gap-3", "text-foreground", className)}
      data-slot="option-list"
      role="group"
      aria-label="Option list"
    >
      <div
        className={cn(
          "group/list bg-card/60 flex w-full flex-col overflow-hidden rounded-2xl border px-5 py-2.5 shadow-xs",
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
          const isDisabled = option.disabled || isSelectionLocked;

          return (
            <Fragment key={option.id}>
              {index > 0 && (
                <Separator
                  className="[&:has(+_:hover)]:opacity-0 [.peer:hover+&]:opacity-0"
                  orientation="horizontal"
                />
              )}
              <Button
                data-id={option.id}
                variant="ghost"
                size="lg"
                role="option"
                aria-selected={isSelected}
                onClick={() => toggleSelection(option.id)}
                disabled={isDisabled}
                className={cn(
                  "peer group relative min-h-[50px] w-full justify-start text-left text-sm font-medium",
                  "rounded-none border-0 bg-transparent px-0 text-base shadow-none transition-none hover:bg-transparent! @[28rem]:text-sm",
                )}
              >
                <span
                  className={cn(
                    "bg-primary/5 active:bg-primary/10 absolute inset-0 -mx-3 -my-0.5 rounded-lg opacity-0 group-hover:opacity-100",
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

      <div
        className={cn(
          "flex items-center gap-4",
          normalizedFooterActions.layout === "stack"
            ? "flex-col items-end"
            : "flex-row justify-end",
        )}
      >
        {resolvedFooterActions.map((action) => {
          const isConfirm = action.id === "confirm";
          const gatedDisabled =
            (isConfirm && isConfirmDisabled) ||
            (!isConfirm && action.id === "cancel" && isCancelDisabled);

          return (
            <Button
              key={action.id}
              variant={action.variant === "ghost" ? "ghost" : "default"}
              size="lg"
              onClick={() => runAction(action.id)}
              disabled={action.isDisabled || gatedDisabled}
              className="text-base @[28rem]:px-3 @[28rem]:py-2 @[28rem]:text-sm"
            >
              {action.isLoading ? (
                <svg
                  className="mr-2 size-4 animate-spin"
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
              ) : null}
              {action.currentLabel}
              {isConfirm &&
                selectionMode === "multi" &&
                selectedCount > 0 &&
                !action.isLoading && <span>{selectedCount}</span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
