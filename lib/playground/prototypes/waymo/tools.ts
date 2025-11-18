/**
 * Core Waymo tools implementation (v0)
 *
 * ARCHITECTURE LAYER 1: Tools
 * - Pure functions that return typed mock data
 * - No React, no UI concerns
 * - Exactly 4 tools following COLLAB_GUIDELINES.md
 *
 * @see ../../../../COLLAB_GUIDELINES.md
 */

import type {
  RiderContext,
  Location,
  PaymentMethod,
  RideQuote,
  BookedTrip,
  GetPickupLocationInput,
  GetPickupLocationOutput,
  GetQuoteInput,
  BookTripInput,
} from "./types";

// Mock data
const MOCK_HOME: Location = {
  address: "123 Main Street, San Francisco, CA 94105",
  lat: 37.7749,
  lng: -122.4194,
  name: "Home",
};

const MOCK_WORK: Location = {
  address: "456 Office Blvd, San Francisco, CA 94103",
  lat: 37.7751,
  lng: -122.4180,
  name: "Work",
};

const MOCK_COFFEE_SHOP: Location = {
  address: "789 Downtown Ave, San Francisco, CA 94102",
  lat: 37.7755,
  lng: -122.4186,
  name: "Downtown Coffee Shop",
};

const MOCK_DEFAULT_PAYMENT: PaymentMethod = {
  id: "pm_1",
  type: "apple_pay",
  isDefault: true,
};

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  MOCK_DEFAULT_PAYMENT,
  {
    id: "pm_2",
    type: "card",
    brand: "visa",
    last4: "4242",
    isDefault: false,
  },
];

// Tool 1: Get rider context
export async function getRiderContext(options?: { noHome?: boolean }): Promise<RiderContext> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // For friction variant: return no home address
  if (options?.noHome) {
    return {
      home: null,
      work: MOCK_WORK,
      frequentDestinations: [MOCK_WORK],
      recentDestinations: [
        {
          address: "1 Market St, San Francisco, CA",
          lat: 37.7946,
          lng: -122.3999,
          name: "Ferry Building",
        },
      ],
      defaultPaymentMethod: MOCK_DEFAULT_PAYMENT,
      paymentMethods: MOCK_PAYMENT_METHODS,
    };
  }

  return {
    home: MOCK_HOME,
    work: MOCK_WORK,
    frequentDestinations: [MOCK_HOME, MOCK_WORK],
    recentDestinations: [
      {
        address: "1 Market St, San Francisco, CA",
        lat: 37.7946,
        lng: -122.3999,
        name: "Ferry Building",
      },
    ],
    defaultPaymentMethod: MOCK_DEFAULT_PAYMENT,
    paymentMethods: MOCK_PAYMENT_METHODS,
  };
}

// Helper to resolve a manual address input
export async function resolveAddress(query: string): Promise<Location> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Mock geocoding - in reality this would hit a geocoding API
  return {
    address: query,
    lat: 37.7858,
    lng: -122.4064,
    name: query.split(",")[0], // Use first part as name
  };
}

// Tool 2: Get pickup location
export async function getPickupLocation(
  _input: GetPickupLocationInput
): Promise<GetPickupLocationOutput> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // For v0, always return high confidence coffee shop location
  // Note: In a real implementation, we'd use the input parameter
  return {
    resolvedLocation: MOCK_COFFEE_SHOP,
    confidence: "high",
  };
}

// Tool 3: Get quote
let quoteCounter = 0;
export async function getQuote(input: GetQuoteInput): Promise<RideQuote> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  quoteCounter++;
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 minutes

  return {
    quoteId: `quote_${quoteCounter}`,
    pickup: input.pickup,
    dropoff: input.dropoff,
    etaMinutes: 5,
    price: {
      amount: 12.50,
      currency: "USD",
      isEstimate: false,
    },
    vehicleInfo: {
      type: "Waymo One",
      capacity: 4,
    },
    expiresAt,
  };
}

// Tool 4: Book trip
let tripCounter = 0;
export async function bookTrip(input: BookTripInput): Promise<BookedTrip> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  tripCounter++;

  // Get the payment method to use
  const paymentMethodId = input.paymentMethodId || MOCK_DEFAULT_PAYMENT.id;
  const paymentMethod = MOCK_PAYMENT_METHODS.find(pm => pm.id === paymentMethodId) || MOCK_DEFAULT_PAYMENT;

  // Format payment summary
  let paymentSummary = "$12.50 charged to ";
  if (paymentMethod.type === "apple_pay") {
    paymentSummary += "Apple Pay";
  } else if (paymentMethod.type === "google_pay") {
    paymentSummary += "Google Pay";
  } else if (paymentMethod.type === "card") {
    paymentSummary += `${paymentMethod.brand?.charAt(0).toUpperCase()}${paymentMethod.brand?.slice(1)} (...${paymentMethod.last4})`;
  }

  return {
    tripId: `trip_${tripCounter}`,
    status: "requested",
    pickup: MOCK_COFFEE_SHOP,
    dropoff: MOCK_HOME,
    etaMinutes: 5,
    price: {
      amount: 12.50,
      currency: "USD",
    },
    paymentSummary,
    vehicle: {
      make: "Jaguar",
      model: "I-PACE",
      color: "White",
      plate: "8ABC123",
    },
  };
}