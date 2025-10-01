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
}

const userEnvConfig: EnvConfig = {
  SERVICE_NAME: process.env.SERVICE_NAME!,
  NODE_ENV: (process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development') as NodeEnv,
  PORT: Number(process.env.PORT)!,

  WEBSITE_URL: process.env.WEBSITE_URL!,
};

export default userEnvConfig;
