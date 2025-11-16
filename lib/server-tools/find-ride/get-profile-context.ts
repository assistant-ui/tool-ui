import {
  DEFAULT_FAVORITES,
  DEFAULT_PICKUP,
  DEFAULT_RECENTS,
  MOCK_NOW,
} from "./shared";

type GetProfileContextResult = {
  asOf: string;
  defaultPickup: typeof DEFAULT_PICKUP;
  favorites: typeof DEFAULT_FAVORITES;
  recents: typeof DEFAULT_RECENTS;
  defaultPayment: { type: "card"; brand: "Visa"; last4: "4242" };
  prefs: { departMode: "now" };
};

const getProfileContext = async (): Promise<GetProfileContextResult> => {
  return {
    asOf: MOCK_NOW,
    defaultPickup: DEFAULT_PICKUP,
    favorites: DEFAULT_FAVORITES,
    recents: DEFAULT_RECENTS,
    defaultPayment: { type: "card", brand: "Visa", last4: "4242" },
    prefs: { departMode: "now" },
  };
};

export default getProfileContext;


