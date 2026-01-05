import type { SerializableOrderSummary } from "@/components/tool-ui/order-summary";
import type { PresetWithCodeGen } from "./types";

export type OrderSummaryPresetName =
  | "default"
  | "with-discount"
  | "free-shipping"
  | "receipt"
  | "international";

function generateOrderSummaryCode(data: SerializableOrderSummary): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);

  if (data.title && data.title !== "Order Summary") {
    props.push(`  title="${data.title}"`);
  }

  props.push(
    `  items={${JSON.stringify(data.items, null, 4).replace(/\n/g, "\n  ")}}`
  );

  props.push(
    `  pricing={${JSON.stringify(data.pricing, null, 4).replace(/\n/g, "\n  ")}}`
  );

  if (data.decision) {
    props.push(
      `  decision={${JSON.stringify(data.decision, null, 4).replace(/\n/g, "\n  ")}}`
    );
  }

  return `<OrderSummary\n${props.join("\n")}\n/>`;
}

export const orderSummaryPresets: Record<
  OrderSummaryPresetName,
  PresetWithCodeGen<SerializableOrderSummary>
> = {
  default: {
    description: "Standard order with multiple items and tax",
    data: {
      id: "order-summary-default",
      items: [
        {
          id: "item-1",
          name: "Premium Coffee Beans",
          description: "Single origin, medium roast",
          imageUrl:
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop",
          quantity: 2,
          unitPrice: 24.0,
        },
        {
          id: "item-2",
          name: "Ceramic Pour-Over Set",
          description: "Includes dripper and carafe",
          imageUrl:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop",
          quantity: 1,
          unitPrice: 45.0,
        },
      ],
      pricing: {
        subtotal: 93.0,
        tax: 7.44,
        shipping: 5.99,
        total: 106.43,
        currency: "USD",
      },
    } satisfies SerializableOrderSummary,
    generateExampleCode: generateOrderSummaryCode,
  },

  "with-discount": {
    description: "Order with promotional discount applied",
    data: {
      id: "order-summary-with-discount",
      title: "Your Cart",
      items: [
        {
          id: "item-1",
          name: "Standing Desk Frame",
          description: "Electric height adjustable, 60\" width",
          imageUrl:
            "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=100&h=100&fit=crop",
          quantity: 1,
          unitPrice: 449.0,
        },
        {
          id: "item-2",
          name: "Bamboo Desktop",
          description: "60\" x 30\" sustainable bamboo",
          imageUrl:
            "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=100&h=100&fit=crop",
          quantity: 1,
          unitPrice: 199.0,
        },
      ],
      pricing: {
        subtotal: 648.0,
        tax: 51.84,
        shipping: 0,
        discount: 64.8,
        discountLabel: "SAVE10 (10% off)",
        total: 635.04,
        currency: "USD",
      },
    } satisfies SerializableOrderSummary,
    generateExampleCode: generateOrderSummaryCode,
  },

  "free-shipping": {
    description: "Order qualifying for free shipping",
    data: {
      id: "order-summary-free-shipping",
      items: [
        {
          id: "item-1",
          name: "Premium Coffee Beans",
          description: "Single origin, medium roast, 1kg bag",
          imageUrl:
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop",
          quantity: 3,
          unitPrice: 28.5,
        },
        {
          id: "item-2",
          name: "Ceramic Pour-Over Set",
          description: "Includes dripper and carafe",
          imageUrl:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop",
          quantity: 1,
          unitPrice: 45.0,
        },
      ],
      pricing: {
        subtotal: 130.5,
        tax: 10.44,
        shipping: 0,
        total: 140.94,
        currency: "USD",
      },
    } satisfies SerializableOrderSummary,
    generateExampleCode: generateOrderSummaryCode,
  },

  receipt: {
    description: "Confirmed order showing receipt state",
    data: {
      id: "order-summary-receipt",
      title: "Order Confirmed",
      items: [
        {
          id: "item-1",
          name: "Running Shoes",
          description: "Lightweight, responsive cushioning",
          imageUrl:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop",
          quantity: 1,
          unitPrice: 129.0,
        },
        {
          id: "item-2",
          name: "Performance Socks",
          description: "3-pack, moisture wicking",
          quantity: 2,
          unitPrice: 18.0,
        },
      ],
      pricing: {
        subtotal: 165.0,
        tax: 13.2,
        shipping: 8.95,
        total: 187.15,
        currency: "USD",
      },
      decision: {
        action: "confirm",
        orderId: "ORD-2024-8847",
        confirmedAt: "2024-12-15T14:32:00Z",
      },
    } satisfies SerializableOrderSummary,
    generateExampleCode: generateOrderSummaryCode,
  },

  international: {
    description: "Order in EUR currency with VAT",
    data: {
      id: "order-summary-international",
      items: [
        {
          id: "item-1",
          name: "Mechanical Keyboard",
          description: "65% layout, hot-swappable switches",
          imageUrl:
            "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=100&h=100&fit=crop",
          quantity: 1,
          unitPrice: 189.0,
        },
        {
          id: "item-2",
          name: "Desk Mat",
          description: "900x400mm, stitched edges",
          quantity: 1,
          unitPrice: 35.0,
        },
      ],
      pricing: {
        subtotal: 224.0,
        tax: 42.56,
        taxLabel: "VAT (19%)",
        shipping: 12.5,
        total: 279.06,
        currency: "EUR",
      },
    } satisfies SerializableOrderSummary,
    generateExampleCode: generateOrderSummaryCode,
  },
};
