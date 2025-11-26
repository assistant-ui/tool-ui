"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import { z } from "zod";
import { DestinationPicker } from "../components";
import type { SelectDestinationResult } from "../types";

/**
 * Hybrid Tool Pattern:
 *
 * This tool supports two interaction modes:
 * 1. User-driven: No destinationId → shows interactive picker, user clicks to select
 * 2. Assistant-driven: With destinationId → shows receipt confirming the selection
 *
 * Use assistant-driven when user expresses destination in text (e.g., "take me home").
 * Use user-driven when destination is unknown (e.g., "I need a ride").
 */
export const SelectDestinationTool = makeAssistantTool<
  { destinationId?: string },
  SelectDestinationResult
>({
  toolName: "select_destination",
  description: `Show destination selection UI. Supports two modes:
- WITHOUT destinationId: Shows interactive picker for user to choose (use when destination unknown)
- WITH destinationId: Shows confirmation receipt (use when user already specified destination in text, e.g., "take me home" → destinationId: "home")

Valid destinationIds: "home", "work", "ferry-building"

Always call this tool to establish destination - it provides visual confirmation whether user clicks or types.`,
  parameters: z.object({
    destinationId: z
      .string()
      .optional()
      .describe(
        "Pre-select a destination when user specified it in text. Omit to show interactive picker."
      ),
  }),
  type: "human",
  render: (props) => <DestinationPicker {...props} />,
});
