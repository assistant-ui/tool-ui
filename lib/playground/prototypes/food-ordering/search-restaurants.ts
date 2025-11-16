import { RESTAURANT_SEARCH_RESULTS } from "./shared";

type SearchRestaurantsArgs = {
  query?: string;
  location?: string;
};

type SearchRestaurantsResult = typeof RESTAURANT_SEARCH_RESULTS;

export const searchRestaurants = async (
  _args: SearchRestaurantsArgs,
): Promise<SearchRestaurantsResult> => {
  return RESTAURANT_SEARCH_RESULTS;
};
