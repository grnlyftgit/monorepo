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
  COOKIE_DOMAIN: string;

  //Better Auth Config
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

const authEnvConfig: EnvConfig = {
  SERVICE_NAME: process.env.SERVICE_NAME!,
  NODE_ENV: (process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development') as NodeEnv,
  PORT: Number(process.env.PORT)!,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN!,

  WEBSITE_URL: process.env.WEBSITE_URL!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
};

export default authEnvConfig;
