"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface UsePresetParamOptions<T extends string> {
  presets: Record<T, unknown>;
  defaultPreset: T;
  paramName?: string;
}

interface UsePresetParamReturn<T extends string> {
  currentPreset: T;
  setPreset: (preset: T) => void;
}

export function usePresetParam<T extends string>({
  presets,
  defaultPreset,
  paramName = "preset",
}: UsePresetParamOptions<T>): UsePresetParamReturn<T> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetKeysRef = useRef<Set<string>>(new Set(Object.keys(presets)));

  const currentParamValue = useMemo(
    () => searchParams.get(paramName),
    [searchParams, paramName],
  );

  const isValidPreset = useCallback(
    (value: string | null): value is T => {
      return value !== null && presetKeysRef.current.has(value);
    },
    [],
  );

  const initialPreset = isValidPreset(currentParamValue)
    ? currentParamValue
    : defaultPreset;

  const [currentPreset, setCurrentPresetState] = useState<T>(initialPreset);

  useEffect(() => {
    if (isValidPreset(currentParamValue)) {
      setCurrentPresetState(currentParamValue);
    }
  }, [currentParamValue, isValidPreset]);

  const setPreset = useCallback(
    (preset: T) => {
      setCurrentPresetState(preset);

      if (currentParamValue === preset) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, preset);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, paramName, currentParamValue],
  );

  return { currentPreset, setPreset };
}
