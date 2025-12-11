"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { ProductList } from "@/components/tool-ui/product-list";
import {
  ProductListPresetName,
  productListPresets,
} from "@/lib/presets/product-list";

export function ProductListPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "keyboards";
  const initialPreset: ProductListPresetName =
    presetParam && presetParam in productListPresets
      ? (presetParam as ProductListPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<ProductListPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in productListPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as ProductListPresetName);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentData = productListPresets[currentPreset].data;

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as ProductListPresetName;
      setCurrentPreset(presetName);
      setIsLoading(false);

      const params = new URLSearchParams(searchParams.toString());
      params.set("preset", presetName);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleProductClick = (productId: string) => {
    console.log("Product clicked:", productId);
  };

  const handleProductAction = (productId: string, actionId: string) => {
    console.log("Product action:", productId, actionId);
    alert(`Action "${actionId}" on product "${productId}"`);
  };

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      presetSelector={
        <PresetSelector
          componentId="product-list"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={() => (
        <ProductList
          {...currentData}
          onProductClick={handleProductClick}
          onProductAction={handleProductAction}
        />
      )}
      renderCodePanel={() => (
        <CodePanel
          className="h-full w-full"
          componentId="product-list"
          productListPreset={currentPreset}
          mode="plain"
        />
      )}
    />
  );
}
