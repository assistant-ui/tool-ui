type ShowRideDetailsArgs = {
  provider: string;
  service: string;
  etaMinutes: number;
  price: number;
  currency?: string;
  pickup: string;
  destination: string;
};

type ShowRideDetailsResult = {
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
  };
};

export const showRideDetails = async ({
  provider,
  service,
  etaMinutes,
  price,
  currency,
  pickup,
  destination,
}: ShowRideDetailsArgs): Promise<ShowRideDetailsResult> => {
  return {
    confirmation: {
      rideId: "RIDE-MOCK-12345",
      provider,
      service,
      etaMinutes,
      price,
      currency: currency ?? "USD",
      pickup,
      destination,
      status: "scheduled",
      pickupWindow: "2024-06-01T12:05:00Z–12:10:00Z",
    },
  };
};
