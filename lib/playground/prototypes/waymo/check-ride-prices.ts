import { MOCK_NOW, RIDE_OPTIONS } from "./shared";

type CheckRidePricesArgs = {
  pickup: string;
  destination: string;
  departureTime?: string;
  services?: string[];
};

type RideOption = (typeof RIDE_OPTIONS)[number];

type CheckRidePricesResult = {
  asOf: string;
  options: readonly RideOption[];
};

export const checkRidePrices = async ({
  services,
}: CheckRidePricesArgs): Promise<CheckRidePricesResult> => {
  const options =
    services && services.length > 0
      ? RIDE_OPTIONS.filter((option) => services.includes(option.service))
      : RIDE_OPTIONS;

  return {
    asOf: MOCK_NOW,
    options,
  };
};
