import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ override: true });

interface AppConfig {
  // Hash Config
  SALT_ROUNDS: number;
  HASH_SECRET?: string;

  //UUID Config
  STARTING_NUMBER: string;

  // Arcjet Config
  ARCJET_KEY: string;
  ARCJET_MODE: string;
}

const config: AppConfig = {
  STARTING_NUMBER: process.env.STARTING_NUMBER || '000001',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS ?? '10', 10),
  HASH_SECRET: process.env.HASH_SECRET!,

  ARCJET_KEY: process.env.ARCJET_KEY!,
  ARCJET_MODE: process.env.ARCJET_MODE!,
};

export default config;
