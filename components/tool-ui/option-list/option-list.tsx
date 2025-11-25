"use client";

import { useMemo, useState, useCallback, useEffect, Fragment } from "react";
import type {
  OptionListProps,
  OptionListSelection,
  OptionListOption,
} from "./schema";
import { ActionButtons, normalizeActionsConfig } from "../shared";
import type { Action } from "../shared";
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

interface SelectionIndicatorProps {
  mode: "multi" | "single";
  isSelected: boolean;
  disabled?: boolean;
}

function SelectionIndicator({
  mode,
  isSelected,
  disabled,
}: SelectionIndicatorProps) {
  const shape = mode === "single" ? "rounded-full" : "rounded";

  return (
    <div
      className={cn(
        "flex size-4 shrink-0 items-center justify-center border-2 transition-colors",
        shape,
        isSelected && "border-primary bg-primary text-primary-foreground",
        !isSelected && "border-muted-foreground/50",
        disabled && "opacity-50",
      )}
    >
      {mode === "multi" && isSelected && <Check className="size-3" />}
      {mode === "single" && isSelected && (
        <span className="size-2 rounded-full bg-current" />
      )}
    </div>
  );
}

interface OptionItemProps {
  option: OptionListOption;
  isSelected: boolean;
  isDisabled: boolean;
  selectionMode: "multi" | "single";
  onToggle: () => void;
}

function OptionItem({
  option,
  isSelected,
  isDisabled,
  selectionMode,
  onToggle,
}: OptionItemProps) {
  return (
    <Button
      data-id={option.id}
      variant="ghost"
      size="lg"
      role="option"
      aria-selected={isSelected}
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        "peer group relative h-auto min-h-[50px] w-full justify-start text-left text-sm font-medium",
        "rounded-none border-0 bg-transparent px-0 py-2 text-base shadow-none transition-none hover:bg-transparent! @md/option-list:text-sm",
      )}
    >
      <span
        className={cn(
          "bg-primary/5 absolute inset-0 -mx-3 -my-0.5 rounded-xl opacity-0 group-hover:opacity-100",
        )}
      />
      <div className="relative flex items-start gap-3">
        <span className="flex h-6 items-center">
          <SelectionIndicator
            mode={selectionMode}
            isSelected={isSelected}
            disabled={option.disabled}
          />
        </span>
        {option.icon && (
          <span className="flex h-6 items-center">{option.icon}</span>
        )}
        <div className="flex flex-col text-left">
          <span className="leading-6">{option.label}</span>
          {option.description && (
            <span className="text-muted-foreground text-sm font-normal">
              {option.description}
            </span>
          )}
        </div>
      </div>
    </Button>
  );
}

interface OptionListReceiptProps {
  options: OptionListOption[];
  confirmedIds: Set<string>;
  className?: string;
}

function OptionListReceipt({
  options,
  confirmedIds,
  className,
}: OptionListReceiptProps) {
  const confirmedOptions = options.filter((opt) => confirmedIds.has(opt.id));

  return (
    <div
      className={cn(
        "@container/option-list flex w-full max-w-md flex-col",
        "text-foreground",
        className,
      )}
      data-slot="option-list"
      data-receipt="true"
      role="status"
      aria-label="Confirmed selection"
    >
      <div
        className={cn(
          "bg-card/60 flex w-full flex-col overflow-hidden rounded-2xl border px-5 py-2.5 shadow-xs",
        )}
      >
        {confirmedOptions.map((option, index) => (
          <Fragment key={option.id}>
            {index > 0 && <Separator orientation="horizontal" />}
            <div className="flex items-start gap-3 py-1">
              <span className="flex h-6 items-center">
                <Check className="text-primary size-4 shrink-0" />
              </span>
              {option.icon && (
                <span className="flex h-6 items-center">{option.icon}</span>
              )}
              <div className="flex flex-col text-left">
                <span className="text-base leading-6 font-medium @md/option-list:text-sm">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-muted-foreground text-sm font-normal">
                    {option.description}
                  </span>
                )}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function OptionList({
  options,
  selectionMode = "multi",
  minSelections = 1,
  maxSelections,
  value,
  defaultValue,
  confirmed,
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

  const handleFooterAction = useCallback(
    async (actionId: string) => {
      if (actionId === "confirm") {
        await handleConfirm();
      } else if (actionId === "cancel") {
        handleCancel();
      }
    },
    [handleConfirm, handleCancel],
  );

  const normalizedFooterActions = useMemo(() => {
    const normalized = normalizeActionsConfig(footerActions);
    if (normalized) return normalized;
    return {
      items: [
        { id: "cancel", label: "Clear", variant: "ghost" as const },
        { id: "confirm", label: "Confirm", variant: "default" as const },
      ],
      align: "right" as const,
    } satisfies ReturnType<typeof normalizeActionsConfig>;
  }, [footerActions]);

  const isConfirmDisabled =
    selectedCount < minSelections || selectedCount === 0;
  const isCancelDisabled = selectedCount === 0;

  const actionsWithDisabledState = useMemo((): Action[] => {
    return normalizedFooterActions.items.map((action) => {
      const gatedDisabled =
        (action.id === "confirm" && isConfirmDisabled) ||
        (action.id === "cancel" && isCancelDisabled);
      return {
        ...action,
        disabled: action.disabled || gatedDisabled,
        label:
          action.id === "confirm" &&
          selectionMode === "multi" &&
          selectedCount > 0
            ? `${action.label} (${selectedCount})`
            : action.label,
      };
    });
  }, [
    normalizedFooterActions.items,
    isConfirmDisabled,
    isCancelDisabled,
    selectionMode,
    selectedCount,
  ]);

  if (confirmed !== undefined && confirmed !== null) {
    const confirmedIds = normalizeToSet(confirmed, selectionMode);
    return (
      <OptionListReceipt
        options={options}
        confirmedIds={confirmedIds}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "@container/option-list flex w-full max-w-md flex-col gap-3",
        "text-foreground",
        className,
      )}
      data-slot="option-list"
      role="group"
      aria-label="Option list"
    >
      <div
        className={cn(
          "group/list bg-card flex w-full flex-col overflow-hidden rounded-2xl border px-4 py-1.5 shadow-xs",
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
              <OptionItem
                option={option}
                isSelected={isSelected}
                isDisabled={isDisabled}
                selectionMode={selectionMode}
                onToggle={() => toggleSelection(option.id)}
              />
            </Fragment>
          );
        })}
      </div>

      <div className="@container/actions">
        <ActionButtons
          actions={actionsWithDisabledState}
          align={normalizedFooterActions.align}
          confirmTimeout={normalizedFooterActions.confirmTimeout}
          onAction={handleFooterAction}
        />
      </div>
    </div>
  );
}
