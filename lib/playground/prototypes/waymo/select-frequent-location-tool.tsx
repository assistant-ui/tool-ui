"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import { z } from "zod";
import {
  DEFAULT_FAVORITES,
  DEFAULT_RECENTS,
} from "./shared";
import { FrequentLocationSelector } from "./wip-tool-uis/FrequentLocationSelector";

type FrequentLocation = {
  id: string;
  label: string;
  address: string;
  category: "favorite" | "recent";
};

type SelectFrequentLocationResult = {
  locations: FrequentLocation[];
  prompt: string;
  selectedLocation?: FrequentLocation;
};

export const SelectFrequentLocationTool = makeAssistantTool<
  Record<string, never>,
  SelectFrequentLocationResult
>({
  toolName: "select_frequent_location",
  description:
    "Present the user's frequent locations (favorites like Home and Work, plus recents) when they request a ride without specifying a destination. Use this to show a visual location picker UI. When the tool result includes `selectedLocation`, treat that as the rider's confirmed destination and continue without calling this tool again.",
  parameters: z.object({}),
  execute: async () => {
    const favorites: FrequentLocation[] = DEFAULT_FAVORITES.map((fav) => ({
      id: fav.id,
      label: fav.label,
      address: fav.address,
      category: "favorite" as const,
    }));

    const recents: FrequentLocation[] = DEFAULT_RECENTS.map((recent) => ({
      id: recent.id,
      label: recent.label,
      address: recent.address,
      category: "recent" as const,
    }));

    return {
      locations: [...favorites, ...recents],
      prompt: "Where would you like to go?",
    };
  },
  render: (props) => <FrequentLocationSelector {...props} />,
});
