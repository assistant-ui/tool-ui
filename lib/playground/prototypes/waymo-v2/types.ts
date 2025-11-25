/**
 * Waymo v2 - Minimal Flow Types
 *
 * Focused types for the three-pattern prototype:
 * - Selection (DestinationPicker)
 * - Confirmation (RideQuote)
 * - Progress (TripStatus)
 */

// ============================================================================
// Domain Types
// ============================================================================

export interface Location {
  id: string;
  label: string; // "Home", "Work", "Ferry Building"
  address: string;
  type: "favorite" | "recent";
}

export interface Price {
  amount: number;
  currency: string;
}

export interface Vehicle {
  type: string; // "Waymo One"
  make: string;
  model: string;
  color: string;
  plate: string;
}

// ============================================================================
// Tool: select_destination
// Pattern: Selection
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SelectDestinationArgs {
  // No args - we show all available options
}

export interface SelectDestinationResult {
  locations: Location[];
  selectedLocation?: Location; // Set when user makes selection
}

// ============================================================================
// Tool: select_pickup
// Pattern: Selection
// ============================================================================

export interface PickupOption {
  id: string;
  label: string;
  address: string;
  type: "current" | "saved";
}

export interface SelectPickupResult {
  selectedPickup?: PickupOption; // Set when user makes selection
}

// ============================================================================
// Tool: get_ride_quote
// Pattern: Confirmation
// ============================================================================

export interface GetRideQuoteArgs {
  destinationId: string;
}

export interface RideQuote {
  quoteId: string;
  pickup: {
    label: string;
    address: string;
  };
  destination: {
    label: string;
    address: string;
  };
  etaMinutes: number;
  price: Price;
  vehicle: {
    type: string;
  };
  payment: {
    method: string; // "Apple Pay", "Visa (...4242)"
  };
  expiresAt: string; // ISO8601
}

export interface GetRideQuoteResult {
  quote: RideQuote;
  confirmed?: boolean; // Set when user confirms
  changePickupRequested?: boolean; // Set when user wants to change pickup location
}

// ============================================================================
// Tool: get_trip_status
// Pattern: Progress
// ============================================================================

export type TripPhase =
  | "requested"
  | "vehicle_assigned"
  | "en_route_to_pickup"
  | "arrived_at_pickup"
  | "trip_in_progress"
  | "arrived_at_destination"
  | "completed"
  | "cancelled";

export interface TripStep {
  phase: TripPhase;
  label: string;
  status: "completed" | "current" | "pending";
  timestamp?: string;
}

export interface GetTripStatusArgs {
  tripId: string;
}

export interface TripStatus {
  tripId: string;
  currentPhase: TripPhase;
  steps: TripStep[];
  vehicle?: Vehicle;
  etaMinutes?: number;
  canCancel: boolean;
}

export interface GetTripStatusResult {
  status: TripStatus;
  cancelled?: boolean; // Set if user cancels
}

// ============================================================================
// Mock Data
// ============================================================================

export const MOCK_LOCATIONS: Location[] = [
  {
    id: "home",
    label: "Home",
    address: "123 Main Street, San Francisco, CA 94105",
    type: "favorite",
  },
  {
    id: "work",
    label: "Work",
    address: "456 Market Street, San Francisco, CA 94103",
    type: "favorite",
  },
  {
    id: "ferry-building",
    label: "Ferry Building",
    address: "1 Ferry Building, San Francisco, CA 94111",
    type: "recent",
  },
];

export const MOCK_PICKUP = {
  label: "Current Location",
  address: "789 Downtown Ave, San Francisco, CA 94102",
};

export const MOCK_VEHICLE: Vehicle = {
  type: "Waymo One",
  make: "Jaguar",
  model: "I-PACE",
  color: "White",
  plate: "8ABC123",
};
