import { DESTINATIONS } from "./shared";

type GetUserDestinationArgs = {
  promptHint?: string;
};

type Destination =
  | typeof DESTINATIONS.home
  | typeof DESTINATIONS.ferry;

type GetUserDestinationResult = {
  destination: Destination;
};

const getUserDestination = async ({
  promptHint,
}: GetUserDestinationArgs): Promise<GetUserDestinationResult> => {
  const useHome =
    promptHint !== undefined &&
    promptHint.toLowerCase().includes("home");
  const destination = useHome ? DESTINATIONS.home : DESTINATIONS.ferry;
  return { destination };
};

export default getUserDestination;


