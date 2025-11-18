/**
 * BookingConfirmation Tool UI Component
 *
 * ARCHITECTURE LAYER 2: Tool UI
 * - Receives props and renders UI
 * - No tool calls, no async logic
 * - Read-only receipt component
 *
 * @see ../../../../../COLLAB_GUIDELINES.md
 */

"use client";

import type { BookingConfirmationProps } from "../types";
import { CheckCircle, MapPin, Clock, CreditCard, Car, Share2, Map } from "lucide-react";

export function BookingConfirmation({ trip }: BookingConfirmationProps) {

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Success header */}
      <div className="border-b bg-green-50 px-6 py-4 dark:bg-green-950/30">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Your Waymo is on the way!
            </h3>
            <p className="text-sm text-muted-foreground">
              Trip ID: {trip.tripId}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Route summary */}
        <div className="mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="flex h-2 w-2 rounded-full bg-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{trip.pickup.name}</div>
              <div className="text-sm text-muted-foreground">{trip.pickup.address}</div>
            </div>
          </div>

          <div className="ml-1 h-6 w-0 border-l-2 border-dashed border-muted-foreground/30" />

          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">{trip.dropoff.name}</div>
              <div className="text-sm text-muted-foreground">{trip.dropoff.address}</div>
            </div>
          </div>
        </div>

        {/* Trip details */}
        <div className="mb-6 space-y-3 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">ETA</span>
            </div>
            <span className="font-medium">{trip.etaMinutes} minutes</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Payment</span>
            </div>
            <span className="text-sm">{trip.paymentSummary}</span>
          </div>

          {trip.vehicle && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Vehicle</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {trip.vehicle.color} {trip.vehicle.make} {trip.vehicle.model}
                </div>
                <div className="text-xs text-muted-foreground">
                  License: {trip.vehicle.plate}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <Map className="h-4 w-4" />
            Track Ride
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <Share2 className="h-4 w-4" />
            Share Trip
          </button>
        </div>
      </div>
    </div>
  );
}