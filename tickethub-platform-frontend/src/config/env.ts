function requiredEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

const isDev = import.meta.env.MODE === "development";

export const env = {
  apiBaseUrl: isDev
    ? requiredEnvVar("VITE_DEV_API_BASE_URL")
    : requiredEnvVar("VITE_PROD_API_BASE_URL"),
  clientUrl: isDev
    ? requiredEnvVar("VITE_DEV_CLIENT_SELF_URL")
    : requiredEnvVar("VITE_PROD_CLIENT_SELF_URL"),
};
