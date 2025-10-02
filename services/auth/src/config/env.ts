import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ override: true });

type NodeEnv = 'development' | 'production';

interface EnvConfig {
  // Server Config
  SERVICE_NAME: string;
  NODE_ENV: NodeEnv;
  PORT: number;
  // Clients urls
  WEBSITE_URL: string;

  //Cookie Config
  COOKIE_PREFIX: string;
  COOKIE_SESSION_TOKEN_NAME: string;
  COOKIE_DOMAIN: string;

  //Better Auth Config
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;

  // Hash Config
  SALT_ROUNDS: number;
  HASH_SECRET: string;

  CORS_WHITELISTED_ORIGINS?: string[];
}

const authEnvConfig: EnvConfig = {
  SERVICE_NAME: process.env.SERVICE_NAME!,
  NODE_ENV: (process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development') as NodeEnv,
  PORT: Number(process.env.PORT)!,

  COOKIE_PREFIX: process.env.COOKIE_PREFIX!,
  COOKIE_SESSION_TOKEN_NAME: process.env.COOKIE_SESSION_TOKEN_NAME!,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN!,

  WEBSITE_URL: process.env.WEBSITE_URL!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS ?? '10', 10),
  HASH_SECRET: process.env.HASH_SECRET!,
  CORS_WHITELISTED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
  ],
};

export default authEnvConfig;
