"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import { z } from "zod";
import { TripStatus } from "../components";
import type { GetTripStatusResult } from "../types";

export const GetTripStatusTool = makeAssistantTool<
  { tripId: string },
  GetTripStatusResult
>({
  toolName: "get_trip_status",
  description:
    "Show live trip timeline with vehicle info. Use after ride is confirmed. Introduce with something like 'Your Waymo is on the way!' If user cancels (result includes cancelled: true), acknowledge.",
  parameters: z.object({
    tripId: z.string().describe("The trip ID from the confirmed booking"),
  }),
  type: "human",
  render: (props) => <TripStatus {...props} />,
});
