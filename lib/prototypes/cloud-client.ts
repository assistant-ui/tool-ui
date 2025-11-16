type CloudClientEnv = {
  available: boolean;
  missing: string[];
  projectId?: string;
  baseUrl?: string;
  tokenPath: string;
};

const CLIENT_REQUIRED_ENV = [
  "NEXT_PUBLIC_ASSISTANT_CLOUD_PROJECT_ID",
  "NEXT_PUBLIC_ASSISTANT_CLOUD_BASE_URL",
] as const;

export const getCloudClientEnv = (): CloudClientEnv => {
  const missing = CLIENT_REQUIRED_ENV.filter(
    (key) => !process.env[key] || process.env[key] === "",
  );

  return {
    available: missing.length === 0,
    missing,
    projectId: process.env.NEXT_PUBLIC_ASSISTANT_CLOUD_PROJECT_ID,
    baseUrl: process.env.NEXT_PUBLIC_ASSISTANT_CLOUD_BASE_URL,
    tokenPath: process.env.NEXT_PUBLIC_ASSISTANT_CLOUD_TOKEN_PATH ?? "/api/assistant-cloud/token",
  };
};


