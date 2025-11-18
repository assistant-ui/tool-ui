/**
 * Shared domain types for Waymo prototype
 *
 * These types are used consistently across all three architecture layers:
 * - Tools return these types
 * - Components receive these as props
 * - Orchestrator passes these between layers
 *
 * @see ../../../../COLLAB_GUIDELINES.md
 */

// Core domain types

export interface Location {
  address: string;
  lat: number;
  lng: number;
  name: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "apple_pay" | "google_pay";
  brand?: string;  // "visa", "mastercard", etc
  last4?: string;  // last 4 digits
  isDefault: boolean;
}

export interface RiderContext {
  home: Location | null;
  work: Location | null;
  frequentDestinations: Location[];
  recentDestinations: Location[];
  defaultPaymentMethod: PaymentMethod | null;
  paymentMethods: PaymentMethod[];
}

export interface RideQuote {
  quoteId: string;
  pickup: Location;
  dropoff: Location;
  etaMinutes: number;
  price: {
    amount: number;
    currency: string;
    isEstimate: boolean;
  };
  vehicleInfo: {
    type: string;  // "Waymo One"
    capacity: number;
  };
  expiresAt: string;  // ISO8601
}

export interface BookedTrip {
  tripId: string;
  status: "requested";
  pickup: Location;
  dropoff: Location;
  etaMinutes: number;
  price: {
    amount: number;
    currency: string;
  };
  paymentSummary: string;  // "$12.50 charged to Apple Pay (...4242)"
  vehicle?: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
}

// Tool-specific types

export interface GetPickupLocationInput {
  hint: "current_location" | string | { lat: number; lng: number };
}

export interface GetPickupLocationOutput {
  resolvedLocation: Location;
  confidence: "high" | "medium" | "low";
}

export interface GetQuoteInput {
  pickup: Location;
  dropoff: Location;
}

export interface BookTripInput {
  quoteId: string;
  paymentMethodId?: string;  // uses default if not specified
}

// Tool UI message format

export interface ToolUIMessage {
  type: "tool-ui";
  component: "RideQuote" | "BookingConfirmation";
  props: RideQuoteProps | BookingConfirmationProps;
}

// Tool UI component props

export interface RideQuoteProps {
  state: "interactive" | "receipt";
  quote: RideQuote;
  paymentMethod: PaymentMethod | null;
  onConfirm?: () => void;
}

export interface BookingConfirmationProps {
  state: "receipt";
  trip: BookedTrip;
}