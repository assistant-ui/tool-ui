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
    "Show ride quote with route, ETA, price, and payment. User can change pickup location inline. When confirmed=true, the ride is booked—call get_trip_status next.",
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
