"use client";

/**
 * PickupPicker - Selection Pattern
 *
 * Shows pickup location options: current GPS location or saved places.
 * Transforms to receipt state showing what was selected.
 */

import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, Home, Briefcase, MapPin, CheckCircle2 } from "lucide-react";
import type { SelectPickupResult } from "../types";
import { MOCK_LOCATIONS, MOCK_PICKUP } from "../types";

interface PickupOption {
  id: string;
  label: string;
  address: string;
  type: "current" | "saved";
}

const getOptionIcon = (option: PickupOption) => {
  if (option.type === "current") {
    return <Navigation className="h-5 w-5" />;
  }
  if (option.label.toLowerCase() === "home") {
    return <Home className="h-5 w-5" />;
  }
  if (option.label.toLowerCase() === "work") {
    return <Briefcase className="h-5 w-5" />;
  }
  return <MapPin className="h-5 w-5" />;
};

// Build pickup options from current location + saved locations
const buildPickupOptions = (): PickupOption[] => {
  const options: PickupOption[] = [
    {
      id: "current",
      label: MOCK_PICKUP.label,
      address: MOCK_PICKUP.address,
      type: "current",
    },
  ];

  // Add saved locations as alternative pickup points
  for (const loc of MOCK_LOCATIONS.filter((l) => l.type === "favorite")) {
    options.push({
      id: loc.id,
      label: loc.label,
      address: loc.address,
      type: "saved",
    });
  }

  return options;
};

export function PickupPicker({
  result,
  addResult,
}: ToolCallMessagePartProps<Record<string, never>, SelectPickupResult>) {
  // Receipt state - show what was selected
  if (result?.selectedPickup) {
    const selected = result.selectedPickup;
    return (
      <Card className="max-w-md p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <div className="text-muted-foreground">
                {getOptionIcon(selected)}
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

  // Interactive state - show picker
  const options = buildPickupOptions();

  const handleSelect = (option: PickupOption) => {
    addResult({
      selectedPickup: option,
    });
  };

  const currentLocation = options.filter((opt) => opt.type === "current");
  const savedPlaces = options.filter((opt) => opt.type === "saved");

  return (
    <Card className="max-w-md space-y-4 p-4">
      {currentLocation.length > 0 && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Navigation className="h-3.5 w-3.5" />
            <span>Current Location</span>
          </div>
          <div className="space-y-2">
            {currentLocation.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="hover:bg-accent h-auto w-full justify-start px-4 py-3 text-left"
                onClick={() => handleSelect(option)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {getOptionIcon(option)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-muted-foreground truncate text-sm">
                      {option.address}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {savedPlaces.length > 0 && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-3.5 w-3.5" />
            <span>Saved Places</span>
          </div>
          <div className="space-y-2">
            {savedPlaces.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="hover:bg-accent h-auto w-full justify-start px-4 py-3 text-left"
                onClick={() => handleSelect(option)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {getOptionIcon(option)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-muted-foreground truncate text-sm">
                      {option.address}
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
