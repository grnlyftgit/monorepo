import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ override: true });

interface AppConfig {
  //UUID Config
  STARTING_NUMBER: string;
}

const config: AppConfig = {
  STARTING_NUMBER: process.env.STARTING_NUMBER || '000001',
};

export default config;
