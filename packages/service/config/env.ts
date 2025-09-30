import { config as dotenvConfig } from "dotenv";
dotenvConfig({ override: true });

interface AppConfig {
  CORS_WHITELISTED_ORIGINS: string[];
  CORS_CREDENTIALS: boolean;
}

const config: AppConfig = {
  CORS_WHITELISTED_ORIGINS: JSON.parse(process.env.CORS_WHITELISTED_ORIGINS || "[]"),
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === "true",
};

export default config;
