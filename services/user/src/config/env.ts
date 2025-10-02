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

  // CORS
  CORS_WHITELISTED_ORIGINS?: string[];
}

const userEnvConfig: EnvConfig = {
  SERVICE_NAME: process.env.SERVICE_NAME!,
  NODE_ENV: (process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development') as NodeEnv,
  PORT: Number(process.env.PORT)!,

  WEBSITE_URL: process.env.WEBSITE_URL!,

  CORS_WHITELISTED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
  ],
};

export default userEnvConfig;
