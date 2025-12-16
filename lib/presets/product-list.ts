import type { SerializableProductList } from "@/components/tool-ui/product-list";
import type { PresetWithCodeGen } from "./types";

export type ProductListPresetName = "keyboards" | "headphones" | "minimal";

function generateProductListCode(data: SerializableProductList): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);

  const productsFormatted = JSON.stringify(data.products, null, 4).replace(
    /\n/g,
    "\n  ",
  );
  props.push(`  products={${productsFormatted}}`);

  props.push(
    `  onProductClick={(productId) => console.log("Clicked:", productId)}`,
  );
  props.push(
    `  onProductAction={(productId, actionId) => console.log("Action:", productId, actionId)}`,
  );

  return `<ProductList\n${props.join("\n")}\n/>`;
}

export const productListPresets: Record<
  ProductListPresetName,
  PresetWithCodeGen<SerializableProductList>
> = {
  keyboards: {
    description: "Mechanical keyboards for comparison shopping",
    data: {
      id: "product-list-keyboards",
      products: [
        {
          id: "kb-1",
          name: "Keychron K8 Pro",
          price: "$109.00",
          color: "#0891b2",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "view", label: "View" },
          ],
        },
        {
          id: "kb-2",
          name: "GMMK Pro",
          price: "$169.99",
          color: "#0284c7",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "view", label: "View" },
          ],
        },
        {
          id: "kb-3",
          name: "Ducky One 3",
          price: "$129.00",
          color: "#2563eb",
          actions: [{ id: "notify", label: "Notify Me" }],
        },
        {
          id: "kb-4",
          name: "Leopold FC660M",
          price: "$119.00",
          color: "#4f46e5",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "view", label: "View" },
          ],
        },
        {
          id: "kb-5",
          name: "Varmilo VA87M",
          price: "$159.00",
          color: "#7c3aed",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "view", label: "View" },
          ],
        },
        {
          id: "kb-6",
          name: "Das Keyboard 4",
          price: "$169.00",
          color: "#9333ea",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "view", label: "View" },
          ],
        },
      ],
    } satisfies SerializableProductList,
    generateExampleCode: generateProductListCode,
  },
  headphones: {
    description: "Audio gear comparison for music lovers",
    data: {
      id: "product-list-headphones",
      products: [
        {
          id: "hp-1",
          name: "Sony WH-1000XM5",
          price: "$349.99",
          color: "#d97706",
          actions: [
            { id: "view", label: "Details", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
        {
          id: "hp-2",
          name: "Bose QuietComfort Ultra",
          price: "$429.00",
          color: "#ea580c",
          actions: [
            { id: "view", label: "Details", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
        {
          id: "hp-3",
          name: "Apple AirPods Max",
          price: "$549.00",
          color: "#dc2626",
          actions: [{ id: "notify", label: "Notify Me" }],
        },
        {
          id: "hp-4",
          name: "Sennheiser Momentum 4",
          price: "$379.95",
          color: "#e11d48",
          actions: [
            { id: "view", label: "Details", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
        {
          id: "hp-5",
          name: "Audio-Technica ATH-M50x",
          price: "$149.00",
          color: "#db2777",
          actions: [
            { id: "view", label: "Details", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
      ],
    } satisfies SerializableProductList,
    generateExampleCode: generateProductListCode,
  },
  minimal: {
    description: "Simple 3-product showcase",
    data: {
      id: "product-list-minimal",
      products: [
        {
          id: "min-1",
          name: "Product Alpha",
          price: "$49.99",
          color: "#0d9488",
          actions: [{ id: "view", label: "View Details" }],
        },
        {
          id: "min-2",
          name: "Product Beta",
          price: "$79.99",
          color: "#059669",
          actions: [{ id: "view", label: "View Details" }],
        },
        {
          id: "min-3",
          name: "Product Gamma",
          price: "$99.99",
          color: "#16a34a",
          actions: [{ id: "view", label: "View Details" }],
        },
      ],
    } satisfies SerializableProductList,
    generateExampleCode: generateProductListCode,
  },
};
