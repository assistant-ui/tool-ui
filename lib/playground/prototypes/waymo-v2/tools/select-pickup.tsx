"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import { z } from "zod";
import { PickupPicker } from "../components/PickupPicker";
import type { SelectPickupResult } from "../types";

export const SelectPickupTool = makeAssistantTool<
  Record<string, never>,
  SelectPickupResult
>({
  toolName: "select_pickup",
  description:
    "Show a picker for selecting pickup location. Options include current GPS location and saved places (Home, Work). Use when user wants to change their pickup location. After selection, show an updated ride quote.",
  parameters: z.object({}),
  type: "human",
  render: (props) => <PickupPicker {...props} />,
});
