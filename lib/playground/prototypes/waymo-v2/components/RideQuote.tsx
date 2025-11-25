"use client";

/**
 * RideQuote - Confirmation Pattern
 *
 * Shows ride details (route, ETA, price) with a Confirm button.
 * Includes secondary action to change pickup location.
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
} from "lucide-react";
import { useState, useMemo } from "react";
import type { GetRideQuoteResult, RideQuote as RideQuoteType } from "../types";
import { MOCK_LOCATIONS, MOCK_PICKUP } from "../types";

const formatPrice = (amount: number, currency: string) => {
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount} ${currency}`;
};

// Generate a mock quote based on destination
const generateQuote = (destinationId: string): RideQuoteType => {
  const destination = MOCK_LOCATIONS.find((loc) => loc.id === destinationId);

  const destInfo = destination ?? {
    label: "Destination",
    address: "Unknown address",
  };

  const prices: Record<string, number> = {
    home: 12.5,
    work: 18.75,
    "ferry-building": 15.0,
  };

  const etas: Record<string, number> = {
    home: 5,
    work: 8,
    "ferry-building": 6,
  };

  return {
    quoteId: `quote_${Date.now()}`,
    pickup: MOCK_PICKUP,
    destination: {
      label: destInfo.label,
      address: destInfo.address,
    },
    etaMinutes: etas[destinationId] ?? 7,
    price: {
      amount: prices[destinationId] ?? 14.0,
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

  // Generate quote from args
  const quote = useMemo(
    () => result?.quote ?? generateQuote(args.destinationId),
    [args.destinationId, result?.quote]
  );

  // Change pickup - hand back to assistant
  const handleChangePickup = () => {
    addResult({
      quote,
      changePickupRequested: true,
    });
  };

  // Change pickup requested - show brief state while assistant responds
  if (result?.changePickupRequested) {
    return (
      <Card className="max-w-md p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-medium">{quote.destination.label}</div>
            <div className="text-muted-foreground text-sm">
              Updating pickup location...
            </div>
          </div>
        </div>
      </Card>
    );
  }

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
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">{quote.etaMinutes} min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {formatPrice(quote.price.amount, quote.price.currency)}
              </span>
            </div>
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
          disabled={isConfirming}
          className="w-full"
          size="lg"
        >
          {isConfirming ? (
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
          onClick={handleChangePickup}
          disabled={isConfirming}
          className="text-muted-foreground w-full"
          size="sm"
        >
          Change pickup location
        </Button>
      </div>
    </Card>
  );
}
