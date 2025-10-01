import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from '@repo/db-neon/src';
import authEnvConfig from '../config/env';
import { openAPI } from "better-auth/plugins"

export const auth = betterAuth({
  baseURL: authEnvConfig.BETTER_AUTH_URL,
  telemetry: { enabled: false },
  basePath:'/v1',
  secret: authEnvConfig.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins:[
    openAPI({
      path:"/docs"
    }),
  ]
});
