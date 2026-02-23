"use client";

import { useState } from "react";
import { DataTable } from "@/components/tool-ui/data-table";
import {
  OptionList,
  type OptionListSelection,
} from "@/components/tool-ui/option-list";
import { OrderSummary } from "@/components/tool-ui/order-summary";
import {
  ParameterSlider,
  type SliderValue,
} from "@/components/tool-ui/parameter-slider";
import {
  PreferencesPanel,
  type PreferencesValue,
} from "@/components/tool-ui/preferences-panel";
import { ToolUI, createDecisionResult } from "@/components/tool-ui/shared";
import { Button } from "@/components/ui/button";
import { MockMessage, MockThread } from "../_components/mock-thread";

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
      <MockMessage role="user">
        Show last month&apos;s travel expenses.
      </MockMessage>
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
              {
                id: "open-report",
                label: "Open Full Report",
                variant: "outline",
              },
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
          {orderChoice ? (
            <OrderSummary.Receipt
              id="flow-decision"
              title="Order Summary"
              items={orderItems}
              pricing={orderPricing}
              choice={orderChoice}
            />
          ) : (
            <OrderSummary.Display
              id="flow-decision"
              title="Order Summary"
              items={orderItems}
              pricing={orderPricing}
            />
          )}
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
              {
                id: "open-report",
                label: "Open Full Report",
                variant: "outline",
              },
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
          {orderChoice ? (
            <OrderSummary.Receipt
              id="decision-actions-order"
              title="Order Summary"
              items={orderItems}
              pricing={orderPricing}
              choice={orderChoice}
            />
          ) : (
            <OrderSummary.Display
              id="decision-actions-order"
              title="Order Summary"
              items={orderItems}
              pricing={orderPricing}
            />
          )}
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
  const [optionOutput, setOptionOutput] = useState<{
    actionId: string;
    state: OptionListSelection;
  } | null>(null);
  const [sliderValues, setSliderValues] =
    useState<SliderValue[]>(initialSliderValues);
  const [sliderOutput, setSliderOutput] = useState<{
    actionId: string;
    state: SliderValue[];
  } | null>(null);
  const [savedPreferences, setSavedPreferences] =
    useState<PreferencesValue | null>(null);
  const [preferencesOutput, setPreferencesOutput] = useState<{
    actionId: string;
    state: PreferencesValue;
  } | null>(null);

  return (
    <div className="not-prose grid gap-8">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="flex flex-col gap-2">
          <h4 className="text-base font-semibold">OptionList</h4>
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
            actions={[
              { id: "cancel", label: "Clear", variant: "ghost" },
              { id: "confirm", label: "Confirm Selection", variant: "default" },
            ]}
            onAction={(actionId, selection) => {
              setOptionOutput({ actionId, state: selection });

              if (actionId === "confirm") {
                setOptionChoice(selection);
                return;
              }

              if (actionId === "cancel") {
                setOptionChoice(undefined);
              }
            }}
          />
          <div className="flex items-center gap-2">
            {optionChoice !== undefined && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setOptionChoice(undefined);
                  setOptionOutput(null);
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
        <div className="border-border bg-card rounded-xl border p-3">
          <p className="text-sm font-medium">Mock output</p>
          <p className="text-muted-foreground mt-1 text-xs">
            <code>onAction(actionId, state)</code>
          </p>
          <pre className="bg-muted mt-3 overflow-auto rounded-md p-3 text-xs leading-relaxed">
            {optionOutput
              ? JSON.stringify(optionOutput, null, 2)
              : `{
  "actionId": "confirm",
  "state": "merge"
}`}
          </pre>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="flex flex-col gap-2">
          <h4 className="text-base font-semibold">ParameterSlider</h4>
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
            actions={[
              { id: "reset", label: "Reset", variant: "ghost" },
              { id: "apply", label: "Apply Adjustments", variant: "default" },
            ]}
            onAction={(actionId, values) => {
              setSliderOutput({ actionId, state: values });
            }}
          />
        </div>
        <div className="border-border bg-card rounded-xl border p-3">
          <p className="text-sm font-medium">Mock output</p>
          <p className="text-muted-foreground mt-1 text-xs">
            <code>onAction(actionId, state)</code>
          </p>
          <pre className="bg-muted mt-3 overflow-auto rounded-md p-3 text-xs leading-relaxed">
            {sliderOutput
              ? JSON.stringify(sliderOutput, null, 2)
              : `{
  "actionId": "apply",
  "state": [
    { "id": "exposure", "value": 0.2 },
    { "id": "contrast", "value": 12 }
  ]
}`}
          </pre>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="flex flex-col gap-2">
          <h4 className="text-base font-semibold">PreferencesPanel</h4>
          <PreferencesPanel
            id="action-centric-preferences-panel"
            title="Notification Preferences"
            sections={preferencesSections}
            actions={[
              { id: "cancel", label: "Cancel", variant: "ghost" },
              { id: "save", label: "Save Preferences", variant: "default" },
            ]}
            onAction={(actionId, value) => {
              setPreferencesOutput({ actionId, state: value });

              if (actionId === "save") {
                setSavedPreferences(value);
                return;
              }
              if (actionId === "cancel") {
                setSavedPreferences(null);
              }
            }}
          />
        </div>
        <div className="border-border bg-card rounded-xl border p-3">
          <p className="text-sm font-medium">Mock output</p>
          <p className="text-muted-foreground mt-1 text-xs">
            <code>onAction(actionId, state)</code>
          </p>
          <pre className="bg-muted mt-3 overflow-auto rounded-md p-3 text-xs leading-relaxed">
            {preferencesOutput
              ? JSON.stringify(preferencesOutput, null, 2)
              : `{
  "actionId": "save",
  "state": {
    "marketing-email": true,
    "digest-frequency": "weekly"
  }
}`}
          </pre>
          {savedPreferences && (
            <p className="text-muted-foreground mt-2 text-xs">
              Last saved values are shown in the callback payload.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
