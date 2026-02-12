import { describe, expect, it } from "vitest";
import {
  parseSerializableOrderSummary,
  safeParseSerializableOrderSummary,
} from "@/components/tool-ui/order-summary";

const baseOrderSummary = {
  id: "order-summary-schema-contract",
  items: [
    {
      id: "item-1",
      name: "Noise Cancelling Headphones",
      unitPrice: 199.99,
      quantity: 1,
    },
  ],
  pricing: {
    subtotal: 199.99,
    tax: 18.0,
    shipping: 0,
    total: 217.99,
    currency: "USD",
  },
};

describe("order summary schema contract", () => {
  it("rejects responseActions in display-only payloads", () => {
    const payload = {
      ...baseOrderSummary,
      responseActions: [{ id: "confirm", label: "Confirm order" }],
    };

    expect(() => parseSerializableOrderSummary(payload)).toThrow();
    expect(safeParseSerializableOrderSummary(payload)).toBeNull();
  });

  it("rejects unknown legacy props in strict payload parsing", () => {
    const payload = {
      ...baseOrderSummary,
      onResponseAction: "legacy-handler",
    };

    expect(() => parseSerializableOrderSummary(payload)).toThrow();
    expect(safeParseSerializableOrderSummary(payload)).toBeNull();
  });
});
