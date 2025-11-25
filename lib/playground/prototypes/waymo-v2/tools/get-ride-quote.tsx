"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import { z } from "zod";
import { RideQuote } from "../components";
import type { GetRideQuoteResult } from "../types";

export const GetRideQuoteTool = makeAssistantTool<
  { destinationId: string },
  GetRideQuoteResult
>({
  toolName: "get_ride_quote",
  description:
    "Show ride quote with route, ETA, price, and payment. When result includes: confirmed=true → acknowledge and call get_trip_status; changePickupRequested=true → immediately call select_pickup tool (do NOT describe the quote in text).",
  parameters: z.object({
    destinationId: z
      .string()
      .describe(
        "The ID of the destination (e.g., 'home', 'work', 'ferry-building')"
      ),
  }),
  type: "human",
  render: (props) => <RideQuote {...props} />,
});
