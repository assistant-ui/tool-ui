import {
  DEFAULT_FAVORITES,
  DEFAULT_RECENTS,
} from "./shared";

type FrequentLocation = {
  id: string;
  label: string;
  address: string;
  category: "favorite" | "recent";
};

type SelectFrequentLocationResult = {
  locations: FrequentLocation[];
  prompt: string;
};

/**
 * Present the user's frequent locations (favorites and recents) for selection.
 * Called when user requests a ride without specifying a destination.
 */
export const selectFrequentLocation = async (): Promise<SelectFrequentLocationResult> => {
  const favorites: FrequentLocation[] = DEFAULT_FAVORITES.map((fav) => ({
    id: fav.id,
    label: fav.label,
    address: fav.address,
    category: "favorite" as const,
  }));

  const recents: FrequentLocation[] = DEFAULT_RECENTS.map((recent) => ({
    id: recent.id,
    label: recent.label,
    address: recent.address,
    category: "recent" as const,
  }));

  return {
    locations: [...favorites, ...recents],
    prompt: "Where would you like to go?",
  };
};
