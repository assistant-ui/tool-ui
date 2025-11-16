type ScheduleRideArgs = {
  provider: string;
  service: string;
  etaMinutes: number;
  price: number;
  currency?: string;
  pickup: string;
  destination: string;
};

type ScheduleRideResult = {
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

export const scheduleRide = async ({
  provider,
  service,
  etaMinutes,
  price,
  currency,
  pickup,
  destination,
}: ScheduleRideArgs): Promise<ScheduleRideResult> => {
  return {
    confirmation: {
      rideId: "RIDE-MOCK-23456",
      provider,
      service,
      etaMinutes,
      price,
      currency: currency ?? "USD",
      pickup,
      destination,
      status: "scheduled",
      pickupWindow: "2024-06-01T12:06:00Z–12:11:00Z",
    },
  };
};
