import { MENU } from "./shared";

type GetMenuArgs = {
  restaurantId: string;
};

type GetMenuResult = typeof MENU;

export const getMenu = async (_args: GetMenuArgs): Promise<GetMenuResult> => {
  return MENU;
};
