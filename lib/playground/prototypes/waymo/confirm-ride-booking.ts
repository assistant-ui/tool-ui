import { MOCK_NOW } from "./shared";

type ConfirmRideBookingArgs = {
  provider: string;
  service: string;
  etaMinutes: number;
  price: number;
  currency?: string;
  pickup: string;
  destination: string;
};

type ConfirmRideBookingResult = {
  confirmation: {
    rideId: string;
    provider: string;
    service: string;
    etaMinutes: number;
    price: number;
    currency: string;
    pickup: string;
    destination: string;
    status: "scheduled";
    pickupWindow: string;
    bookedAt: string;
  };
};

const buildRideId = (provider: string, service: string) => {
  const base = `${provider}-${service}`.toUpperCase();
  const suffix = base.replace(/[^A-Z0-9]/gi, "").slice(0, 5) || "RIDE";
  return `RIDE-MOCK-${suffix}`;
};

export const confirmRideBooking = async ({
  provider,
  service,
  etaMinutes,
  price,
  currency,
  pickup,
  destination,
}: ConfirmRideBookingArgs): Promise<ConfirmRideBookingResult> => {
  return {
    confirmation: {
      rideId: buildRideId(provider, service),
      provider,
      service,
      etaMinutes,
      price,
      currency: currency ?? "USD",
      pickup,
      destination,
      status: "scheduled",
      pickupWindow: "2024-06-01T12:06:00Z–12:11:00Z",
      bookedAt: MOCK_NOW,
    },
  };
};
