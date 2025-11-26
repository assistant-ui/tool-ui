"use client";

/**
 * DestinationPicker - Hybrid Selection Pattern
 *
 * Supports two interaction modes:
 * 1. User-driven: No args.destinationId → shows interactive picker
 * 2. Assistant-driven: With args.destinationId → auto-selects and shows receipt
 *
 * This enables both clicking the UI and typing in chat to work seamlessly.
 */

import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Briefcase, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import type { Location, SelectDestinationResult } from "../types";
import { MOCK_LOCATIONS } from "../types";

const getLocationIcon = (location: Location) => {
  if (location.label.toLowerCase() === "home") {
    return <Home className="h-5 w-5" />;
  }
  if (location.label.toLowerCase() === "work") {
    return <Briefcase className="h-5 w-5" />;
  }
  return <MapPin className="h-5 w-5" />;
};

const getCategoryIcon = (type: Location["type"]) => {
  if (type === "favorite") {
    return <MapPin className="h-3.5 w-3.5" />;
  }
  return <Clock className="h-3.5 w-3.5" />;
};

export function DestinationPicker({
  args,
  result,
  addResult,
}: ToolCallMessagePartProps<
  { destinationId?: string },
  SelectDestinationResult
>) {
  const locations = MOCK_LOCATIONS;

  // Assistant-driven: auto-select when destinationId is provided
  useEffect(() => {
    if (args.destinationId && !result) {
      const location = locations.find((loc) => loc.id === args.destinationId);
      if (location) {
        addResult({
          locations,
          selectedLocation: location,
        });
      }
    }
  }, [args.destinationId, result, locations, addResult]);

  // Receipt state - show what was selected (either by user click or assistant)
  if (result?.selectedLocation) {
    const selected = result.selectedLocation;
    return (
      <Card className="max-w-md p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <div className="text-muted-foreground">
                {getLocationIcon(selected)}
              </div>
              <span className="font-semibold">{selected.label}</span>
            </div>
            <div className="text-muted-foreground text-sm">
              {selected.address}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // If destinationId was provided but location not found, show error state
  if (args.destinationId) {
    return (
      <Card className="max-w-md p-4">
        <div className="text-muted-foreground text-sm">
          Location &quot;{args.destinationId}&quot; not found. Please select from
          the options below.
        </div>
      </Card>
    );
  }

  // Interactive state - show picker (user-driven mode)
  const favorites = locations.filter((loc) => loc.type === "favorite");
  const recents = locations.filter((loc) => loc.type === "recent");

  const handleSelect = (location: Location) => {
    addResult({
      locations,
      selectedLocation: location,
    });
  };

  return (
    <Card className="max-w-md space-y-4 p-4">

      {favorites.length > 0 && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            {getCategoryIcon("favorite")}
            <span>Favorites</span>
          </div>
          <div className="space-y-2">
            {favorites.map((location) => (
              <Button
                key={location.id}
                variant="outline"
                className="hover:bg-accent h-auto w-full justify-start px-4 py-3 text-left"
                onClick={() => handleSelect(location)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {getLocationIcon(location)}
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
            {getCategoryIcon("recent")}
            <span>Recent</span>
          </div>
          <div className="space-y-2">
            {recents.map((location) => (
              <Button
                key={location.id}
                variant="outline"
                className="hover:bg-accent h-auto w-full justify-start px-4 py-3 text-left"
                onClick={() => handleSelect(location)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {getLocationIcon(location)}
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
    </Card>
  );
}
