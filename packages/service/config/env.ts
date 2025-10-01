import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ override: true });

interface AppConfig {
  CORS_WHITELISTED_ORIGINS: string[];
  CORS_CREDENTIALS: boolean;

  // Hash Config
  SALT_ROUNDS?: number;
  HASH_SECRET?: string;

  //UUID Config
  STARTING_NUMBER: string;
}

const config: AppConfig = {
  CORS_WHITELISTED_ORIGINS: JSON.parse(
    process.env.CORS_WHITELISTED_ORIGINS || '[]'
  ),
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  SALT_ROUNDS: process.env.SALT_ROUNDS
    ? parseInt(process.env.SALT_ROUNDS, 10)
    : undefined,
  HASH_SECRET: process.env.HASH_SECRET || undefined,

  STARTING_NUMBER: process.env.STARTING_NUMBER || '000001',
};

export default config;
