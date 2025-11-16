import { PLACE_CHOICES } from "./shared";

type SearchPlacesArgs = {
  query: string;
  near?: string;
};

type PlaceChoice = (typeof PLACE_CHOICES)[number];

type SearchPlacesResult = {
  near: string | null;
  choices: PlaceChoice[];
};

export const searchPlaces = async ({
  query,
  near,
}: SearchPlacesArgs): Promise<SearchPlacesResult> => {
  const normalized = query.toLowerCase();
  const choices = PLACE_CHOICES.filter(
    (choice) =>
      choice.label.toLowerCase().includes(normalized) ||
      choice.address.toLowerCase().includes(normalized),
  );

  return {
    near: near ?? null,
    choices,
  };
};
