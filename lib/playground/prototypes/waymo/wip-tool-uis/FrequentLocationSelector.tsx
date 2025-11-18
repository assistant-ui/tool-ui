"use client";

import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Briefcase, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { DEFAULT_FAVORITES, DEFAULT_RECENTS } from "../shared";

type FrequentLocation = {
  id: string;
  label: string;
  address: string;
  category: "favorite" | "recent";
};

export type SelectFrequentLocationResult = {
  selectedLocation?: FrequentLocation;
};

const getLocationIcon = (label: string) => {
  const lower = label.toLowerCase();
  if (lower === "home") return <Home className="h-5 w-5" />;
  if (lower === "work") return <Briefcase className="h-5 w-5" />;
  return <MapPin className="h-5 w-5" />;
};

const getFavoritesAndRecents = () => {
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
};

export const FrequentLocationSelector = ({
  result,
  addResult,
}: ToolCallMessagePartProps<
  Record<string, never>,
  SelectFrequentLocationResult
>) => {
  // Receipt Mode - Show what was selected
  const selectedLocation = result?.selectedLocation;
  if (selectedLocation) {
    return (
      <Card className="max-w-md p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <div className="text-muted-foreground">
                {getLocationIcon(selectedLocation.label)}
              </div>
              <span className="font-semibold">{selectedLocation.label}</span>
            </div>
            <div className="text-muted-foreground text-sm">
              {selectedLocation.address}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Interactive Mode - Show location options
  const { locations, prompt } = getFavoritesAndRecents();
  const favorites = locations.filter((loc) => loc.category === "favorite");
  const recents = locations.filter((loc) => loc.category === "recent");

  return (
    <Card className="max-w-md space-y-4 p-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{prompt}</h3>
        <p className="text-muted-foreground text-sm">
          Select a frequent location or search for a new one
        </p>
      </div>

      {favorites.length > 0 && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-3.5 w-3.5" />
            <span>Favorites</span>
          </div>
          <div className="space-y-2">
            {favorites.map((location) => (
              <Button
                key={location.id}
                variant="outline"
                className="hover:bg-accent h-auto w-full justify-start px-4 py-3 text-left"
                onClick={() =>
                  addResult({
                    selectedLocation: location,
                  })
                }
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {getLocationIcon(location.label)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{location.label}</div>
                    <div className="text-muted-foreground truncate text-sm">
                      {location.address}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {recents.length > 0 && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>Recent</span>
          </div>
          <div className="space-y-2">
            {recents.map((location) => (
              <Button
                key={location.id}
                variant="outline"
                className="hover:bg-accent h-auto w-full justify-start px-4 py-3 text-left"
                onClick={() =>
                  addResult({
                    selectedLocation: location,
                  })
                }
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {getLocationIcon(location.label)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{location.label}</div>
                    <div className="text-muted-foreground truncate text-sm">
                      {location.address}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="text-muted-foreground text-center text-sm">
        or type a different location
      </div>
    </Card>
  );
};
