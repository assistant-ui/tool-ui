"use client";

import { useCallback, useMemo } from "react";
import {
  OptionList,
  parseSerializableOptionList,
  type OptionListSelection,
} from "@/components/tool-ui/option-list";
import { useWidgetState, useOpenAI } from "../openai-context";

type OptionListWidgetState = Record<string, unknown> & {
  confirmedIds?: OptionListSelection;
};

export function OptionListSDK(props: Record<string, unknown>) {
  const parsed = parseSerializableOptionList(props);
  const { setWidgetState } = useOpenAI();
  const [widgetState] = useWidgetState<OptionListWidgetState>();

  const confirmedValue = useMemo(() => {
    if (parsed.confirmed !== undefined) {
      return parsed.confirmed;
    }
    return widgetState?.confirmedIds ?? undefined;
  }, [parsed.confirmed, widgetState?.confirmedIds]);

  const handleConfirm = useCallback(
    async (value: OptionListSelection) => {
      await setWidgetState({
        confirmedIds: value,
      });
    },
    [setWidgetState],
  );

  return (
    <OptionList
      {...parsed}
      confirmed={confirmedValue}
      onConfirm={handleConfirm}
    />
  );
}
