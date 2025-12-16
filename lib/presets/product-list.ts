import type { SerializableProductList } from "@/components/tool-ui/product-list";
import type { PresetWithCodeGen } from "./types";

export type ProductListPresetName = "keyboards" | "headphones" | "minimal";

function generateProductListCode(data: SerializableProductList): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(
    `  products={${JSON.stringify(data.products, null, 4).replace(/\n/g, "\n  ")}}`,
  );
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
          image: "https://placehold.co/300x400/1a1a2e/ffffff?text=K8+Pro",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "view", label: "View" },
          ],
        },
        {
          id: "kb-2",
          name: "GMMK Pro",
          price: "$169.99",
          image: "https://placehold.co/300x400/16213e/ffffff?text=GMMK+Pro",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "view", label: "View" },
          ],
        },
        {
          id: "kb-3",
          name: "Ducky One 3",
          price: "$129.00",
          image: "https://placehold.co/300x400/0f3460/ffffff?text=Ducky+One",
          actions: [{ id: "notify", label: "Notify Me" }],
        },
        {
          id: "kb-4",
          name: "Leopold FC660M",
          price: "$119.00",
          image: "https://placehold.co/300x400/1a1a2e/ffffff?text=Leopold",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "view", label: "View" },
          ],
        },
        {
          id: "kb-5",
          name: "Varmilo VA87M",
          price: "$159.00",
          image: "https://placehold.co/300x400/16213e/ffffff?text=Varmilo",
          actions: [
            { id: "compare", label: "Compare", variant: "secondary" },
            { id: "view", label: "View" },
          ],
        },
        {
          id: "kb-6",
          name: "Das Keyboard 4",
          price: "$169.00",
          image: "https://placehold.co/300x400/0f3460/ffffff?text=Das+KB",
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
          image: "https://placehold.co/300x400/2d132c/ffffff?text=Sony+XM5",
          actions: [
            { id: "view", label: "Details", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
        {
          id: "hp-2",
          name: "Bose QuietComfort Ultra",
          price: "$429.00",
          image: "https://placehold.co/300x400/3d1c4c/ffffff?text=Bose+QC",
          actions: [
            { id: "view", label: "Details", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
        {
          id: "hp-3",
          name: "Apple AirPods Max",
          price: "$549.00",
          image: "https://placehold.co/300x400/4a235a/ffffff?text=AirPods",
          actions: [{ id: "notify", label: "Notify Me" }],
        },
        {
          id: "hp-4",
          name: "Sennheiser Momentum 4",
          price: "$379.95",
          image: "https://placehold.co/300x400/2d132c/ffffff?text=Sennheiser",
          actions: [
            { id: "view", label: "Details", variant: "secondary" },
            { id: "cart", label: "Add to Cart" },
          ],
        },
        {
          id: "hp-5",
          name: "Audio-Technica ATH-M50x",
          price: "$149.00",
          image: "https://placehold.co/300x400/3d1c4c/ffffff?text=ATH-M50x",
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
          image: "https://placehold.co/300x400/1e3a5f/ffffff?text=Alpha",
          actions: [{ id: "view", label: "View Details" }],
        },
        {
          id: "min-2",
          name: "Product Beta",
          price: "$79.99",
          image: "https://placehold.co/300x400/2e4a6f/ffffff?text=Beta",
          actions: [{ id: "view", label: "View Details" }],
        },
        {
          id: "min-3",
          name: "Product Gamma",
          price: "$99.99",
          image: "https://placehold.co/300x400/3e5a7f/ffffff?text=Gamma",
          actions: [{ id: "view", label: "View Details" }],
        },
      ],
    } satisfies SerializableProductList,
    generateExampleCode: generateProductListCode,
  },
};
