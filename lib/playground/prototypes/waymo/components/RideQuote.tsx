/**
 * RideQuote Tool UI Component
 *
 * ARCHITECTURE LAYER 2: Tool UI
 * - Receives props and renders UI
 * - No tool calls, no async logic
 * - Callbacks passed from orchestrator
 * - States: "interactive" | "receipt"
 *
 * @see ../../../../../COLLAB_GUIDELINES.md
 */

"use client";

import type { RideQuoteProps } from "../types";
import { MapPin, Clock, DollarSign, CheckCircle } from "lucide-react";

export function RideQuote({
  state,
  quote,
  paymentMethod,
  onConfirm,
}: RideQuoteProps) {
  const formatPrice = (amount: number, currency: string) => {
    if (currency === "USD") return `$${amount.toFixed(2)}`;
    return `${amount} ${currency}`;
  };

  const formatPayment = () => {
    if (!paymentMethod) return "No payment method";

    if (paymentMethod.type === "apple_pay") return "Apple Pay";
    if (paymentMethod.type === "google_pay") return "Google Pay";
    if (paymentMethod.type === "card" && paymentMethod.brand) {
      const brand =
        paymentMethod.brand.charAt(0).toUpperCase() +
        paymentMethod.brand.slice(1);
      return `${brand} (...${paymentMethod.last4})`;
    }

    return "Payment method";
  };

  if (state === "receipt") {
    // Receipt mode - collapsed summary
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-900 dark:text-green-100">
            Ride confirmed
          </span>
        </div>
        <div className="mt-2 text-sm text-green-800 dark:text-green-200">
          <div>
            {quote.pickup.name} → {quote.dropoff.name}
          </div>
          <div className="mt-1 text-xs text-green-700 dark:text-green-300">
            {quote.etaMinutes} min •{" "}
            {formatPrice(quote.price.amount, quote.price.currency)}
          </div>
        </div>
      </div>
    );
  }

  // Interactive mode - full card
  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-foreground text-lg font-semibold">
          Waymo Ride Quote
        </h3>
      </div>

      {/* Route */}
      <div className="mb-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <div className="flex h-2 w-2 rounded-full bg-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-muted-foreground text-sm">Pickup</div>
            <div className="font-medium">{quote.pickup.name}</div>
            <div className="text-muted-foreground text-sm">
              {quote.pickup.address}
            </div>
          </div>
        </div>

        <div className="border-muted-foreground/30 ml-1 h-8 w-0 border-l-2 border-dashed" />

        <div className="flex items-start gap-3">
          <div className="mt-1">
            <MapPin className="text-muted-foreground h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-muted-foreground text-sm">Dropoff</div>
            <div className="font-medium">{quote.dropoff.name}</div>
            <div className="text-muted-foreground text-sm">
              {quote.dropoff.address}
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
              <span className="font-medium">{quote.etaMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">
                {formatPrice(quote.price.amount, quote.price.currency)}
                {quote.price.isEstimate && (
                  <span className="text-muted-foreground ml-1 text-xs">
                    (estimate)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="text-muted-foreground mt-2 text-sm">
          {quote.vehicleInfo.type} • Seats {quote.vehicleInfo.capacity}
        </div>
      </div>

      {/* Payment */}
      <div className="bg-background mb-6 flex items-center justify-between rounded-lg border p-3">
        <span className="text-muted-foreground text-sm">Payment</span>
        <span className="text-sm font-medium">{formatPayment()}</span>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary w-full rounded-lg px-4 py-3 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        Confirm Ride
      </button>
    </div>
  );
}
