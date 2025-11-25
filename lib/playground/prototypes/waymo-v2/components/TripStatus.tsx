"use client";

/**
 * TripStatus - Progress Pattern
 *
 * Shows live trip progress with a timeline.
 * Updates as the trip progresses through phases.
 */

import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Car, XCircle } from "lucide-react";
import type { GetTripStatusResult, TripStep, TripStatus as TripStatusType } from "../types";
import { MOCK_VEHICLE } from "../types";

const StepIcon = ({ status }: { status: TripStep["status"] }) => {
  if (status === "completed") {
    return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  }
  if (status === "current") {
    return (
      <div className="relative">
        <Circle className="h-5 w-5 text-blue-600 fill-blue-600" />
        <div className="absolute inset-0 animate-ping">
          <Circle className="h-5 w-5 text-blue-600 opacity-50" />
        </div>
      </div>
    );
  }
  return <Circle className="text-muted-foreground/40 h-5 w-5" />;
};

// Generate initial trip status
const generateTripStatus = (tripId: string): TripStatusType => {
  return {
    tripId,
    currentPhase: "vehicle_assigned",
    steps: [
      {
        phase: "requested",
        label: "Ride requested",
        status: "completed",
        timestamp: "Just now",
      },
      {
        phase: "vehicle_assigned",
        label: "Vehicle assigned",
        status: "current",
      },
      {
        phase: "en_route_to_pickup",
        label: "On the way to you",
        status: "pending",
      },
      {
        phase: "arrived_at_pickup",
        label: "Arrived at pickup",
        status: "pending",
      },
      {
        phase: "trip_in_progress",
        label: "Trip in progress",
        status: "pending",
      },
      {
        phase: "arrived_at_destination",
        label: "Arrived at destination",
        status: "pending",
      },
    ],
    vehicle: MOCK_VEHICLE,
    etaMinutes: 3,
    canCancel: true,
  };
};

export function TripStatus({
  args,
  result,
  addResult,
}: ToolCallMessagePartProps<{ tripId: string }, GetTripStatusResult>) {
  // Generate status from args
  const status = result?.status ?? generateTripStatus(args.tripId);

  // Cancelled state
  if (result?.cancelled) {
    return (
      <Card className="max-w-md p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-red-600">
            <XCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Ride cancelled</div>
            <div className="text-muted-foreground mt-1 text-sm">
              Your ride has been cancelled. No charge.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Completed state - receipt
  if (status.currentPhase === "completed") {
    return (
      <Card className="max-w-md p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Trip completed</div>
            <div className="text-muted-foreground mt-1 text-sm">
              Thanks for riding with Waymo!
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const handleCancel = () => {
    addResult({
      status,
      cancelled: true,
    });
  };

  return (
    <Card className="max-w-md p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Your ride</h3>
        {status.etaMinutes && (
          <p className="text-muted-foreground text-sm">
            {status.etaMinutes} min away
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="mb-5 space-y-0">
        {status.steps.map((step, index) => (
          <div key={step.phase} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepIcon status={step.status} />
              {index < status.steps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 my-1 ${
                    step.status === "completed"
                      ? "bg-green-600"
                      : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div
                className={`font-medium ${
                  step.status === "pending"
                    ? "text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {step.label}
              </div>
              {step.timestamp && (
                <div className="text-muted-foreground text-xs">
                  {step.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle info */}
      {status.vehicle && (
        <div className="bg-muted/50 mb-4 flex items-center gap-3 rounded-lg p-3">
          <Car className="text-muted-foreground h-5 w-5" />
          <div>
            <div className="text-sm font-medium">
              {status.vehicle.color} {status.vehicle.make} {status.vehicle.model}
            </div>
            <div className="text-muted-foreground text-xs">
              {status.vehicle.plate}
            </div>
          </div>
        </div>
      )}

      {/* Cancel button */}
      {status.canCancel && (
        <Button
          variant="outline"
          onClick={handleCancel}
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Cancel Ride
        </Button>
      )}
    </Card>
  );
}
