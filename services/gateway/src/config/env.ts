import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ override: true });

type NodeEnv = 'development' | 'production';

interface AppConfig {
  // Server Config
  NODE_ENV: NodeEnv;
  PORT: number;
  // Clients urls
  WEBSITE_URL: string;
  // Microservices service urls
  AUTH_SERVICE_URL: string;
  USER_SERVICE_URL: string;

  // CORS
  CORS_WHITELISTED_ORIGINS?: string[];
}

const config: AppConfig = {
  NODE_ENV: (process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development') as NodeEnv,
  PORT: Number(process.env.PORT)!,

  WEBSITE_URL: process.env.WEBSITE_URL!,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL!,
  USER_SERVICE_URL: process.env.USER_SERVICE_URL!,
  CORS_WHITELISTED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
  ],
};

export default config;
