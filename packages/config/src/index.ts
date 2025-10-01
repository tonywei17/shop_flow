export const getEnv = (key: string, fallback?: string) => process.env[key] ?? fallback ?? "";
export const configReady = true;
