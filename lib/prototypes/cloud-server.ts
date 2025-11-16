type CloudServerEnv = {
  ready: boolean;
  missing: string[];
  tokenEndpoint?: string;
  apiKey?: string;
  projectId?: string;
  defaultTTL: number;
};

const SERVER_REQUIRED_ENV = [
  "ASSISTANT_CLOUD_TOKEN_ENDPOINT",
  "ASSISTANT_CLOUD_API_KEY",
] as const;

export const getCloudServerEnv = (): CloudServerEnv => {
  const missing = SERVER_REQUIRED_ENV.filter(
    (key) => !process.env[key] || process.env[key] === "",
  );

  return {
    ready: missing.length === 0,
    missing,
    tokenEndpoint: process.env.ASSISTANT_CLOUD_TOKEN_ENDPOINT,
    apiKey: process.env.ASSISTANT_CLOUD_API_KEY,
    projectId:
      process.env.ASSISTANT_CLOUD_PROJECT_ID ??
      process.env.NEXT_PUBLIC_ASSISTANT_CLOUD_PROJECT_ID,
    defaultTTL: Number(process.env.ASSISTANT_CLOUD_TOKEN_TTL ?? 900),
  };
};


