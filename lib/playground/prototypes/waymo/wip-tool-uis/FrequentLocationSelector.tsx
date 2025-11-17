"use client";

import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Briefcase, MapPin, Clock } from "lucide-react";

type FrequentLocation = {
  id: string;
  label: string;
  address: string;
  category: "favorite" | "recent";
};

type SelectFrequentLocationResult = {
  locations: FrequentLocation[];
  prompt: string;
};

const getLocationIcon = (label: string) => {
  const lower = label.toLowerCase();
  if (lower === "home") return <Home className="h-5 w-5" />;
  if (lower === "work") return <Briefcase className="h-5 w-5" />;
  return <MapPin className="h-5 w-5" />;
};

export const FrequentLocationSelector: ToolCallMessagePartComponent = ({ result }) => {
  if (!result || typeof result !== "object") {
    return null;
  }

  const data = result as SelectFrequentLocationResult;
  const { locations, prompt } = data;

  const favorites = locations.filter((loc) => loc.category === "favorite");
  const recents = locations.filter((loc) => loc.category === "recent");

  return (
    <Card className="p-4 space-y-4 max-w-md">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{prompt}</h3>
        <p className="text-sm text-muted-foreground">
          Select a frequent location or search for a new one
        </p>
      </div>

      {favorites.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>Favorites</span>
          </div>
          <div className="space-y-2">
            {favorites.map((location) => (
              <Button
                key={location.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                disabled
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5 text-muted-foreground">
                    {getLocationIcon(location.label)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{location.label}</div>
                    <div className="text-sm text-muted-foreground truncate">
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
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Recent</span>
          </div>
          <div className="space-y-2">
            {recents.map((location) => (
              <Button
                key={location.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                disabled
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5 text-muted-foreground">
                    {getLocationIcon(location.label)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{location.label}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {location.address}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      <Button variant="ghost" className="w-full" disabled>
        Search for a different location
      </Button>
    </Card>
  );
};
