"use client";

/**
 * RideQuote - Confirmation Pattern with Inline Pickup Selection
 *
 * Shows ride details (route, ETA, price) with a Confirm button.
 * Handles pickup location changes inline without requiring a separate tool call.
 *
 * Transforms to receipt state after confirmation.
 */

import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  CreditCard,
  Car,
  CheckCircle2,
  Loader2,
  Navigation,
  Home,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { GetRideQuoteResult, RideQuote as RideQuoteType } from "../types";
import { MOCK_LOCATIONS, MOCK_PICKUP } from "../types";

// Pickup option for inline selection
interface PickupOption {
  id: string;
  label: string;
  address: string;
  type: "current" | "saved";
}

const formatPrice = (amount: number, currency: string) => {
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount} ${currency}`;
};

// Build pickup options for inline selection
const buildPickupOptions = (): PickupOption[] => {
  const options: PickupOption[] = [
    {
      id: "current",
      label: MOCK_PICKUP.label,
      address: MOCK_PICKUP.address,
      type: "current",
    },
  ];

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

const getPickupIcon = (option: PickupOption) => {
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

// Generate a mock quote based on destination and pickup
const generateQuote = (
  destinationId: string,
  pickupOverride?: { label: string; address: string }
): RideQuoteType => {
  const destination = MOCK_LOCATIONS.find((loc) => loc.id === destinationId);

  const destInfo = destination ?? {
    label: "Destination",
    address: "Unknown address",
  };

  // Base prices - adjust slightly based on pickup location
  const basePrices: Record<string, number> = {
    home: 12.5,
    work: 18.75,
    "ferry-building": 15.0,
  };

  const baseEtas: Record<string, number> = {
    home: 5,
    work: 8,
    "ferry-building": 6,
  };

  // Slight variation if pickup is not current location
  const priceMultiplier = pickupOverride ? 1.1 : 1.0;
  const etaAddition = pickupOverride ? 2 : 0;

  return {
    quoteId: `quote_${Date.now()}`,
    pickup: pickupOverride ?? MOCK_PICKUP,
    destination: {
      label: destInfo.label,
      address: destInfo.address,
    },
    etaMinutes: (baseEtas[destinationId] ?? 7) + etaAddition,
    price: {
      amount: (basePrices[destinationId] ?? 14.0) * priceMultiplier,
      currency: "USD",
    },
    vehicle: {
      type: "Waymo One",
    },
    payment: {
      method: "Apple Pay",
    },
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
};

export function RideQuote({
  args,
  result,
  addResult,
}: ToolCallMessagePartProps<{ destinationId: string }, GetRideQuoteResult>) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [mode, setMode] = useState<"quote" | "selecting-pickup">("quote");
  const [currentPickup, setCurrentPickup] = useState<{
    label: string;
    address: string;
  } | null>(null);

  // Generate quote based on current pickup
  const quote = result?.quote ?? generateQuote(
    args.destinationId,
    currentPickup ?? undefined
  );

  // Simulate async price/ETA calculation
  useEffect(() => {
    // Skip loading simulation if we already have a result
    if (result) {
      setIsPriceLoading(false);
      return;
    }

    setIsPriceLoading(true);
    const timer = setTimeout(() => {
      setIsPriceLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [result, currentPickup]); // Re-run when pickup changes

  // Handle pickup selection
  const handleSelectPickup = useCallback((option: PickupOption) => {
    setCurrentPickup({ label: option.label, address: option.address });
    setMode("quote");
  }, []);

  // Receipt state - show confirmation
  if (result?.confirmed) {
    return (
      <Card className="max-w-md p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Ride confirmed</div>
            <div className="text-muted-foreground mt-1 text-sm">
              {quote.pickup.label} → {quote.destination.label}
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              {quote.etaMinutes} min •{" "}
              {formatPrice(quote.price.amount, quote.price.currency)}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const handleConfirm = () => {
    setIsConfirming(true);
    // Simulate brief delay for booking
    setTimeout(() => {
      addResult({
        quote,
        confirmed: true,
      });
    }, 800);
  };

  // Pickup selection mode
  if (mode === "selecting-pickup") {
    const pickupOptions = buildPickupOptions();
    const currentOptions = pickupOptions.filter((o) => o.type === "current");
    const savedOptions = pickupOptions.filter((o) => o.type === "saved");

    return (
      <Card className="max-w-md p-4">
        {/* Header with back button */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground -ml-2 h-8 w-8 p-0"
            onClick={() => setMode("quote")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Select pickup location</span>
        </div>

        {/* Current Location */}
        {currentOptions.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <Navigation className="h-3.5 w-3.5" />
              <span>Current Location</span>
            </div>
            {currentOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="hover:bg-accent h-auto w-full justify-start px-3 py-2.5 text-left"
                onClick={() => handleSelectPickup(option)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {getPickupIcon(option)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {option.address}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Saved Places */}
        {savedOptions.length > 0 && (
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <MapPin className="h-3.5 w-3.5" />
              <span>Saved Places</span>
            </div>
            {savedOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="hover:bg-accent h-auto w-full justify-start px-3 py-2.5 text-left"
                onClick={() => handleSelectPickup(option)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {getPickupIcon(option)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {option.address}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="max-w-md p-5">
      {/* Route */}
      <div className="mb-4 space-y-3">
        {/* Pickup */}
        <div className="flex items-start gap-3">
          <div className="mt-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">
              Pickup
            </div>
            <div className="font-medium">{quote.pickup.label}</div>
            <div className="text-muted-foreground truncate text-sm">
              {quote.pickup.address}
            </div>
          </div>
        </div>

        <div className="border-muted-foreground/30 ml-[5px] h-6 w-0 border-l-2 border-dashed" />

        {/* Destination */}
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <MapPin className="text-muted-foreground h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-muted-foreground text-xs uppercase tracking-wide">
              Destination
            </div>
            <div className="font-medium">{quote.destination.label}</div>
            <div className="text-muted-foreground text-sm">
              {quote.destination.address}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-muted/50 mb-4 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isPriceLoading ? (
              <>
                <div className="bg-muted-foreground/20 h-5 w-16 animate-pulse rounded" />
                <div className="bg-muted-foreground/20 h-6 w-20 animate-pulse rounded" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">{quote.etaMinutes} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {formatPrice(quote.price.amount, quote.price.currency)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
          <Car className="h-4 w-4" />
          <span>{quote.vehicle.type}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="mb-5 flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <CreditCard className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-sm">Payment</span>
        </div>
        <span className="text-sm font-medium">{quote.payment.method}</span>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={handleConfirm}
          disabled={isPriceLoading || isConfirming}
          className="w-full"
          size="lg"
        >
          {isPriceLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            "Confirm Ride"
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setMode("selecting-pickup")}
          disabled={isPriceLoading || isConfirming}
          className="text-muted-foreground w-full"
          size="sm"
        >
          Change pickup location
        </Button>
      </div>
    </Card>
  );
}
