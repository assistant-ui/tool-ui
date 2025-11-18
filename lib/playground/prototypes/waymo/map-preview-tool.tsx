"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { z } from "zod";

import {
  MapPreviewCard,
  type MapLocation,
  type MapPreviewCardProps,
} from "./wip-tool-uis/MapPreview";

const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
});

const mapPreviewSchema = z.object({
  pickup: locationSchema,
  dropoff: locationSchema,
  etaMinutes: z.number().optional(),
});

type MapPreviewArgs = z.infer<typeof mapPreviewSchema>;

type MapPreviewResult = MapPreviewArgs & {
  status: MapPreviewCardProps["status"];
};

const MapPreviewToolUI = ({
  result,
  addResult,
}: ToolCallMessagePartProps<MapPreviewArgs, MapPreviewResult>) => {
  const data = result;
  if (!data) {
    return null;
  }

  const handleConfirm = () => {
    if (data.status === "confirmed") return;
    addResult({ ...data, status: "confirmed" });
  };

  return (
    <MapPreviewCard
      pickup={data.pickup as MapLocation}
      dropoff={data.dropoff as MapLocation}
      etaMinutes={data.etaMinutes}
      status={data.status}
      onConfirm={handleConfirm}
    />
  );
};

export const MapPreviewTool = makeAssistantTool<MapPreviewArgs, MapPreviewResult>({
  toolName: "map_preview",
  description:
    "Display a map preview of the rider's pickup and dropoff before confirming the quote.",
  parameters: mapPreviewSchema,
  execute: async (args) => ({
    pickup: args.pickup,
    dropoff: args.dropoff,
    etaMinutes: args.etaMinutes,
    status: "preview",
  }),
  render: (props) => <MapPreviewToolUI {...props} />,
});
