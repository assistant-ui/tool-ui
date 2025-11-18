"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import { z } from "zod";
import {
  FrequentLocationSelector,
  SelectFrequentLocationResult,
} from "./wip-tool-uis/FrequentLocationSelector";

export const SelectFrequentLocationTool = makeAssistantTool<
  Record<string, never>,
  SelectFrequentLocationResult
>({
  toolName: "select_frequent_location",
  description:
    "Present the user's frequent locations (favorites like Home and Work, plus recents) when they request a ride without specifying a destination. Use this to show a visual location picker UI. When the tool result includes `selectedLocation`, treat that as the rider's confirmed destination and continue without calling this tool again.",
  parameters: z.object({}),
  type: "human",
  render: (props) => <FrequentLocationSelector {...props} />,
});
