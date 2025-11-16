import { DEFAULT_PICKUP } from "./shared";

type GetUserLocationArgs = {
  allow_gps?: boolean;
};

type GetUserLocationResult = {
  pickup: typeof DEFAULT_PICKUP;
};

const getUserLocation = async (
  _args: GetUserLocationArgs,
): Promise<GetUserLocationResult> => {
  return { pickup: DEFAULT_PICKUP };
};

export default getUserLocation;


