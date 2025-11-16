import { RESTAURANT_DETAILS } from "./shared";

type GetRestaurantDetailsArgs = {
  restaurantId: string;
};

type GetRestaurantDetailsResult = typeof RESTAURANT_DETAILS;

export const getRestaurantDetails = async (
  _args: GetRestaurantDetailsArgs,
): Promise<GetRestaurantDetailsResult> => {
  return RESTAURANT_DETAILS;
};
