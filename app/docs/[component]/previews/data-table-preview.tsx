"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { DataTable } from "@/components/tool-ui/data-table";
import { PresetName, presets, SortState } from "@/lib/presets/data-table";

export function DataTablePreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "stocks";
  const initialPreset: PresetName =
    presetParam && presetParam in presets
      ? (presetParam as PresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] = useState<PresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<SortState>(
    presets[initialPreset].defaultSort ?? {},
  );
  const [emptyMessage, setEmptyMessage] = useState(
    presets[initialPreset].emptyMessage ?? "No data available",
  );

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in presets &&
      presetParam !== currentPreset
    ) {
      const nextConfig = presets[presetParam as PresetName];
      setCurrentPreset(presetParam as PresetName);
      setSort(nextConfig.defaultSort ?? {});
      setEmptyMessage(nextConfig.emptyMessage ?? "No data available");
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = presets[currentPreset];

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as PresetName;
      const nextConfig = presets[presetName];
      setCurrentPreset(presetName);
      setSort(nextConfig.defaultSort ?? {});
      setEmptyMessage(nextConfig.emptyMessage ?? "No data available");
      setIsLoading(false);

      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("preset", presetName);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      presetSelector={
        <PresetSelector
          componentId="data-table"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(loading) => (
        <DataTable
          {...currentConfig}
          sort={sort}
          onSortChange={setSort}
          isLoading={loading}
          emptyMessage={emptyMessage}
          footerActions={currentConfig.footerActions}
          onFooterAction={(actionId) => {
            console.log("Footer action:", actionId);
          }}
        />
      )}
      renderCodePanel={(loading) => (
        <CodePanel
          className="h-full w-full"
          componentId="data-table"
          config={currentConfig}
          sort={sort}
          isLoading={loading}
          emptyMessage={emptyMessage}
          mode="plain"
        />
      )}
    />
  );
}
