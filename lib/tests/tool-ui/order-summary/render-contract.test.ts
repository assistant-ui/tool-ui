import React from "react";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OrderSummary } from "@/components/tool-ui/order-summary";

const baseOrderSummary = {
  id: "order-summary-render-contract",
  items: [
    {
      id: "item-1",
      name: "Wireless Keyboard",
      unitPrice: 79.99,
      quantity: 1,
    },
  ],
  pricing: {
    subtotal: 79.99,
    tax: 6.4,
    shipping: 0,
    total: 86.39,
    currency: "USD",
  },
};

describe("order summary render contract", () => {
  it("is server-renderable (no client directive)", () => {
    const sourcePath = path.join(
      process.cwd(),
      "components/tool-ui/order-summary/order-summary.tsx",
    );
    const source = fs.readFileSync(sourcePath, "utf8");

    expect(source).not.toContain('"use client"');
  });

  it("does not render action buttons in display-only mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrderSummary, baseOrderSummary),
    );

    expect(html).not.toContain("@container/actions");
    expect(html).not.toContain("<button");
    expect(html).toContain("Wireless Keyboard");
  });

  it("renders receipt metadata when choice is present", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrderSummary, {
        ...baseOrderSummary,
        choice: {
          action: "confirm" as const,
          orderId: "ORD-42",
          confirmedAt: "2026-01-10T11:35:00.000Z",
        },
      }),
    );

    expect(html).toContain("#ORD-42");
    expect(html).toContain("Order Summary");
  });
});
