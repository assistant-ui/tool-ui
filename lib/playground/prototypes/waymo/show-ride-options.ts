import {
  DEFAULT_PICKUP,
  MOCK_NOW,
  SUGGESTION_REASONS,
  SUGGESTION_SERVICES,
} from "./shared";
import type { Candidate } from "./shared";

type ShowRideOptionsArgs = {
  pickup: string;
  candidates: Candidate[];
};

type RideSuggestionsResult = {
  asOf: string;
  pickup: {
    address: string;
    label: string;
  };
  suggestions: Array<{
    id: string;
    label: string;
    address: string;
    topService: {
      service: (typeof SUGGESTION_SERVICES)[number];
      etaMinutes: number;
      price: number;
      currency: "USD";
    };
    reasonTag: (typeof SUGGESTION_REASONS)[number];
  }>;
  defaultPayment: { type: "card"; brand: "Visa"; last4: "4242" };
};

export const showRideOptions = async ({
  pickup,
  candidates,
}: ShowRideOptionsArgs): Promise<RideSuggestionsResult> => {
  const suggestions = candidates.slice(0, 3).map((candidate, index) => {
    const service = SUGGESTION_SERVICES[index % SUGGESTION_SERVICES.length];
    const eta = [3, 7, 12][index % 3];
    const price = [17.5, 22.25, 45.0][index % 3];
    const reason = SUGGESTION_REASONS[index % SUGGESTION_REASONS.length];

    return {
      id: candidate.id,
      label: candidate.label,
      address: candidate.address,
      topService: {
        service,
        etaMinutes: eta,
        price,
        currency: "USD" as const,
      },
      reasonTag: reason,
    };
  });

  return {
    asOf: MOCK_NOW,
    pickup: {
      address: pickup,
      label: DEFAULT_PICKUP.label,
    },
    suggestions,
    defaultPayment: { type: "card", brand: "Visa", last4: "4242" },
  };
};
