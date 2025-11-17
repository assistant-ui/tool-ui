type ToggleGpsArgs = {
  isEnabled?: boolean;
};

type ToggleGpsResult = {
  isEnabled: boolean;
};

export const toggleGps = async ({
  isEnabled = false,
}: ToggleGpsArgs): Promise<ToggleGpsResult> => {
  return { isEnabled };
};
