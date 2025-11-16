type ToggleGpsArgs = {
  isEnabled?: boolean;
};

type ToggleGpsResult = {
  isEnabled: boolean;
};

const toggleGps = async ({
  isEnabled = false,
}: ToggleGpsArgs): Promise<ToggleGpsResult> => {
  return { isEnabled };
};

export default toggleGps;


