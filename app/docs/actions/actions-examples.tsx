"use client";

import { useState } from "react";
import { DataTable } from "@/components/tool-ui/data-table";
import { OptionList, type OptionListSelection } from "@/components/tool-ui/option-list";
import { OrderSummary } from "@/components/tool-ui/order-summary";
import { ParameterSlider, type SliderValue } from "@/components/tool-ui/parameter-slider";
import {
  PreferencesPanel,
  type PreferencesValue,
} from "@/components/tool-ui/preferences-panel";
import { ToolUI, createDecisionResult } from "@/components/tool-ui/shared";
import { Button } from "@/components/ui/button";
import { MockMessage, MockThread } from "../_components/mock-thread";

function formatSelection(value: OptionListSelection): string {
  if (value === null) return "No selection";
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "No selection";
  }
  return value;
}

const tableRows = [
  { id: "1", merchant: "Delta Airlines", amount: 847 },
  { id: "2", merchant: "Acme Hotel", amount: 312 },
];

const orderItems = [
  { id: "sku-1", name: "Wireless Keyboard", unitPrice: 89, quantity: 1 },
  { id: "sku-2", name: "Mouse", unitPrice: 49, quantity: 1 },
];

const orderPricing = {
  subtotal: 138,
  shipping: 0,
  tax: 12.42,
  total: 150.42,
  currency: "USD",
};

const initialSliderValues: SliderValue[] = [
  { id: "exposure", value: 0.2 },
  { id: "contrast", value: 12 },
];

const preferencesSections = [
  {
    heading: "Notifications",
    items: [
      {
        id: "marketing-email",
        type: "switch" as const,
        label: "Marketing email",
        description: "Receive product announcements and feature updates.",
        defaultChecked: true,
      },
      {
        id: "digest-frequency",
        type: "toggle" as const,
        label: "Digest frequency",
        description: "How often we send summary emails.",
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
        ],
        defaultValue: "weekly",
      },
    ],
  },
];

export function ActionFlowToolCallVisual() {
  return (
    <MockThread caption="Step 1: the model chooses a tool call.">
      <MockMessage role="user">Show last month&apos;s travel expenses.</MockMessage>
      <MockMessage role="assistant">
        <div className="border-border bg-card rounded-xl border p-3 text-sm">
          Calling <code>getExpenses</code> with args:
          <pre className="bg-muted mt-2 overflow-x-auto rounded-md p-2 text-xs">
{`{
  "month": "2026-01",
  "category": "travel"
}`}
          </pre>
        </div>
      </MockMessage>
    </MockThread>
  );
}

export function ActionFlowRenderVisual() {
  return (
    <div className="not-prose max-w-2xl">
      <DataTable
        id="flow-render-surface"
        rowIdKey="id"
        columns={[
          { key: "merchant", label: "Merchant" },
          { key: "amount", label: "Amount", align: "right" },
        ]}
        data={tableRows}
      />
    </div>
  );
}

export function ActionFlowUserActionVisual() {
  const [event, setEvent] = useState("No action clicked yet.");

  return (
    <div className="not-prose flex max-w-2xl flex-col gap-3">
      <ToolUI id="flow-local-action">
        <ToolUI.Surface>
          <DataTable
            id="flow-local-action"
            rowIdKey="id"
            columns={[
              { key: "merchant", label: "Merchant" },
              { key: "amount", label: "Amount", align: "right" },
            ]}
            data={tableRows}
          />
        </ToolUI.Surface>
        <ToolUI.Actions>
          <ToolUI.LocalActions
            actions={[
              { id: "export-csv", label: "Export CSV", variant: "secondary" },
              { id: "open-report", label: "Open Full Report", variant: "outline" },
            ]}
            onAction={(actionId) => {
              setEvent(`Clicked: ${actionId}`);
            }}
          />
        </ToolUI.Actions>
      </ToolUI>
      <p className="text-muted-foreground text-xs">{event}</p>
    </div>
  );
}

export function ActionFlowRuntimeHandleVisual() {
  const [state, setState] = useState<"idle" | "handling" | "done">("idle");

  return (
    <div className="not-prose flex max-w-xl flex-col gap-3">
      <div className="border-border bg-card rounded-xl border p-4">
        <p className="text-sm font-medium">Runtime status</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {state === "idle" && "Waiting for a user action."}
          {state === "handling" && "Handling action and running side effect..."}
          {state === "done" && "Action handled successfully."}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setState("handling");
            setTimeout(() => setState("done"), 600);
          }}
        >
          Simulate handler
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setState("idle")}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export function ActionFlowCommitVisual() {
  const [orderChoice, setOrderChoice] = useState<
    { action: "confirm"; orderId?: string; confirmedAt?: string } | undefined
  >();
  const [event, setEvent] = useState("No decision committed yet.");

  return (
    <div className="not-prose flex max-w-md flex-col gap-3">
      <ToolUI id="flow-decision">
        <ToolUI.Surface>
          <OrderSummary
            id="flow-decision"
            title="Order Summary"
            items={orderItems}
            pricing={orderPricing}
            choice={orderChoice}
          />
        </ToolUI.Surface>
        {!orderChoice && (
          <ToolUI.Actions>
            <ToolUI.DecisionActions
              actions={[
                { id: "cancel", label: "Cancel", variant: "outline" },
                { id: "confirm", label: "Purchase", variant: "default" },
              ]}
              onAction={(action) =>
                createDecisionResult({
                  decisionId: "flow-order-decision",
                  action,
                  payload:
                    action.id === "confirm"
                      ? {
                          orderId: `ORD-${Date.now()}`,
                          confirmedAt: new Date().toISOString(),
                        }
                      : undefined,
                })
              }
              onCommit={(result) => {
                if (result.actionId !== "confirm") {
                  setEvent("Decision cancelled.");
                  return;
                }

                const orderId =
                  typeof result.payload?.orderId === "string"
                    ? result.payload.orderId
                    : `ORD-${Date.now()}`;
                const confirmedAt =
                  typeof result.payload?.confirmedAt === "string"
                    ? result.payload.confirmedAt
                    : new Date().toISOString();

                setOrderChoice({
                  action: "confirm",
                  orderId,
                  confirmedAt,
                });
                setEvent(`Committed decision: ${orderId}`);
              }}
            />
          </ToolUI.Actions>
        )}
      </ToolUI>
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground text-xs">{event}</p>
        {orderChoice && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setOrderChoice(undefined);
              setEvent("Decision reset for demo.");
            }}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

export function DisplaySurfaceLocalActionsExample() {
  const [event, setEvent] = useState("Try a local action below.");

  return (
    <div className="not-prose flex max-w-2xl flex-col gap-3">
      <ToolUI id="display-local-actions-table">
        <ToolUI.Surface>
          <DataTable
            id="display-local-actions-table"
            rowIdKey="id"
            columns={[
              { key: "merchant", label: "Merchant" },
              { key: "amount", label: "Amount", align: "right" },
            ]}
            data={tableRows}
          />
        </ToolUI.Surface>
        <ToolUI.Actions>
          <ToolUI.LocalActions
            actions={[
              { id: "export-csv", label: "Export CSV", variant: "secondary" },
              { id: "open-report", label: "Open Full Report", variant: "outline" },
            ]}
            onAction={(actionId) => {
              setEvent(`Local action executed: ${actionId}`);
            }}
          />
        </ToolUI.Actions>
      </ToolUI>
      <p className="text-muted-foreground text-xs">{event}</p>
    </div>
  );
}

export function DecisionSurfaceExample() {
  const [orderChoice, setOrderChoice] = useState<
    { action: "confirm"; orderId?: string; confirmedAt?: string } | undefined
  >();
  const [event, setEvent] = useState("No decision committed yet.");

  return (
    <div className="not-prose flex max-w-md flex-col gap-3">
      <ToolUI id="decision-actions-order">
        <ToolUI.Surface>
          <OrderSummary
            id="decision-actions-order"
            title="Order Summary"
            items={orderItems}
            pricing={orderPricing}
            choice={orderChoice}
          />
        </ToolUI.Surface>
        {!orderChoice && (
          <ToolUI.Actions>
            <ToolUI.DecisionActions
              actions={[
                { id: "cancel", label: "Cancel", variant: "outline" },
                { id: "confirm", label: "Purchase", variant: "default" },
              ]}
              onAction={(action) =>
                createDecisionResult({
                  decisionId: "decision-actions-order-decision",
                  action,
                  payload:
                    action.id === "confirm"
                      ? {
                          orderId: `ORD-${Date.now()}`,
                          confirmedAt: new Date().toISOString(),
                        }
                      : undefined,
                })
              }
              onCommit={(result) => {
                if (result.actionId !== "confirm") {
                  setEvent("Decision cancelled.");
                  return;
                }

                const orderId =
                  typeof result.payload?.orderId === "string"
                    ? result.payload.orderId
                    : `ORD-${Date.now()}`;
                const confirmedAt =
                  typeof result.payload?.confirmedAt === "string"
                    ? result.payload.confirmedAt
                    : new Date().toISOString();

                setOrderChoice({
                  action: "confirm",
                  orderId,
                  confirmedAt,
                });
                setEvent(`Committed decision envelope: ${orderId}`);
              }}
            />
          </ToolUI.Actions>
        )}
      </ToolUI>
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground text-xs">{event}</p>
        {orderChoice && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setOrderChoice(undefined);
              setEvent("Decision reset for demo.");
            }}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

export function ActionCentricExceptionsExample() {
  const [optionChoice, setOptionChoice] = useState<OptionListSelection>();
  const [optionEvent, setOptionEvent] = useState("No selection confirmed yet.");
  const [sliderValues, setSliderValues] = useState<SliderValue[]>(
    initialSliderValues,
  );
  const [sliderEvent, setSliderEvent] = useState(
    "Move sliders, then press Apply.",
  );
  const [savedPreferences, setSavedPreferences] =
    useState<PreferencesValue | null>(null);
  const [preferencesEvent, setPreferencesEvent] = useState(
    "No save action yet.",
  );

  return (
    <div className="not-prose grid gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="text-base font-semibold">
          OptionList uses <code>selectionActions</code>
        </h4>
        <OptionList
          id="action-centric-option-list"
          selectionMode="single"
          options={[
            {
              id: "merge",
              label: "Merge duplicates",
              description: "Combine records and preserve all unique fields.",
            },
            {
              id: "keep",
              label: "Keep separate",
              description: "Leave both records untouched.",
            },
            {
              id: "review",
              label: "Review manually",
              description: "Open each pair for manual confirmation.",
            },
          ]}
          choice={optionChoice}
          selectionActions={[
            { id: "cancel", label: "Clear", variant: "ghost" },
            { id: "confirm", label: "Confirm Selection", variant: "default" },
          ]}
          onConfirm={(selection) => {
            setOptionChoice(selection);
            setOptionEvent(`Selection committed: ${formatSelection(selection)}`);
          }}
          onSelectionAction={(actionId) => {
            setOptionEvent(`OptionList action fired: ${actionId}`);
          }}
        />
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-xs">{optionEvent}</p>
          {optionChoice !== undefined && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setOptionChoice(undefined);
                setOptionEvent("Selection reset for demo.");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-base font-semibold">
          ParameterSlider uses <code>adjustmentActions</code>
        </h4>
        <ParameterSlider
          id="action-centric-parameter-slider"
          sliders={[
            {
              id: "exposure",
              label: "Exposure",
              min: -2,
              max: 2,
              step: 0.1,
              value: 0.2,
              unit: " EV",
              precision: 1,
            },
            {
              id: "contrast",
              label: "Contrast",
              min: -50,
              max: 50,
              step: 1,
              value: 12,
              unit: "%",
            },
          ]}
          values={sliderValues}
          onChange={setSliderValues}
          adjustmentActions={[
            { id: "reset", label: "Reset", variant: "ghost" },
            { id: "apply", label: "Apply Adjustments", variant: "default" },
          ]}
          onAdjustmentAction={(actionId, values) => {
            if (actionId !== "apply") return;
            const summary = values
              .map((value) => `${value.id}: ${value.value}`)
              .join(", ");
            setSliderEvent(`Applied values: ${summary}`);
          }}
        />
        <p className="text-muted-foreground text-xs">{sliderEvent}</p>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-base font-semibold">
          PreferencesPanel uses <code>formActions</code>
        </h4>
        <PreferencesPanel
          id="action-centric-preferences-panel"
          title="Notification Preferences"
          sections={preferencesSections}
          formActions={[
            { id: "cancel", label: "Cancel", variant: "ghost" },
            { id: "save", label: "Save Preferences", variant: "default" },
          ]}
          onFormAction={(actionId, value) => {
            if (actionId === "save") {
              setSavedPreferences(value);
              setPreferencesEvent("Preferences saved.");
              return;
            }
            if (actionId === "cancel") {
              setSavedPreferences(null);
              setPreferencesEvent("Edit cancelled.");
            }
          }}
        />
        <p className="text-muted-foreground text-xs">{preferencesEvent}</p>
        <pre className="bg-muted overflow-auto rounded-md p-3 text-xs leading-relaxed">
          {savedPreferences
            ? JSON.stringify(savedPreferences, null, 2)
            : "No saved preferences yet."}
        </pre>
      </div>
    </div>
  );
}
