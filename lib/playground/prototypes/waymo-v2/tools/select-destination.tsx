"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import { z } from "zod";
import { DestinationPicker } from "../components";
import type { SelectDestinationResult } from "../types";

/**
 * Selection Tool - Destination Picker
 *
 * Only use when destination is unknown. If user already specified where
 * they want to go ("take me home"), skip this and call get_ride_quote directly.
 * The quote UI shows the destination, so a separate picker would be redundant.
 */
export const SelectDestinationTool = makeAssistantTool<
  Record<string, never>,
  SelectDestinationResult
>({
  toolName: "select_destination",
  description:
    "Show destination picker with saved locations (Home, Work) and recents. Only use when destination is unknown. If user already said where ('take me home'), skip this and call get_ride_quote directly.",
  parameters: z.object({}),
  type: "human",
  render: (props) => <DestinationPicker {...props} />,
});
