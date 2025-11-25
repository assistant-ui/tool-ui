"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import { z } from "zod";
import { DestinationPicker } from "../components";
import type { SelectDestinationResult } from "../types";

export const SelectDestinationTool = makeAssistantTool<
  Record<string, never>,
  SelectDestinationResult
>({
  toolName: "select_destination",
  description:
    "Show a picker with saved locations (Home, Work) and recents. Use when user wants a ride but hasn't said where. Introduce it briefly (e.g. 'Where to?'). When result includes selectedLocation, acknowledge their choice before continuing.",
  parameters: z.object({}),
  type: "human",
  render: (props) => <DestinationPicker {...props} />,
});
