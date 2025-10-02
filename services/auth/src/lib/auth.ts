import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { neonDB } from '@repo/db-neon/src';
import authEnvConfig from '../config/env';
import { admin, emailOTP, openAPI, phoneNumber } from 'better-auth/plugins';
import { siteData } from '@repo/seo/metadata';
import config from '@repo/service/config/env';
import { createLogger } from '@repo/service/lib/logger';
import { generateUID } from '@repo/service/utils/private/uid-generator';
import { generateRandomUsername } from '@repo/service/utils';
import { PasswordUtils } from '@repo/service/utils/private/hash-passowrd';
import * as schema from '@repo/db-neon/src/db/schema';
import { passkey } from 'better-auth/plugins/passkey';
import { redisClient } from '@repo/db-aws-redis/src';

const logger = createLogger('BetterAuth');
const isDev = authEnvConfig.NODE_ENV === 'development';
const redis = redisClient.getClient();

export const auth: any = betterAuth({
  appName: siteData.name,
  baseURL: authEnvConfig.BETTER_AUTH_URL,
  telemetry: { enabled: false },
  basePath: '/',
  secret: authEnvConfig.BETTER_AUTH_SECRET,
  trustedOrigins: config.CORS_WHITELISTED_ORIGINS,
  database: drizzleAdapter(neonDB, {
    provider: 'pg',
    schema,
  }),
  secondaryStorage: {
    get: async (key) => {
      return await redis.get(key);
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, 'EX', ttl);
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  plugins: [
    openAPI({ path: '/docs' }),
    passkey(),
    phoneNumber({
      requireVerification: true,
      allowedAttempts: 5,
      otpLength: 6,
      expiresIn: 600, // 10 min
      sendOTP: ({ phoneNumber, code }) => {
        logger.info(`Sending OTP ${code} to phone number ${phoneNumber}`);
        // TODO: Integrate your SMS gateway here to send OTP
      },
      signUpOnVerification: {
        // On successful phone OTP verification for new user, generate temp email & username
        getTempEmail: () => {
          const domain =
            authEnvConfig.COOKIE_DOMAIN?.replace(/^\./, '') ?? 'example.com';
          return `${generateRandomUsername()}@${domain}`;
        },
        getTempName: () => {
          return generateRandomUsername();
        },
      },
    }),

    // Email OTP plugin for verification after phone signup/login
    emailOTP({
      allowedAttempts: 5,
      otpLength: 6,
      expiresIn: 600, // 10 min
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        logger.info(`Sending email OTP ${otp} to ${email} for type ${type}`);
        // TODO: Integrate your email service to send email OTP here
      },
    }),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password) => {
        return await PasswordUtils.hash(password, config.HASH_SECRET);
      },
      verify: async ({ password, hash }) => {
        return await PasswordUtils.verify(password, hash, config.HASH_SECRET);
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day
    },
  },

  advanced: {
    cookiePrefix: 'grnlyft',
    disableCSRFCheck: isDev,
    cookies: {
      session_token: {
        name: 'grnlyft.session_token',
      },
    },
    cookieOptions: {
      httpOnly: true,
      sameSite: isDev ? 'lax' : 'strict',
      path: '/',
      ...(authEnvConfig.COOKIE_DOMAIN && {
        domain: authEnvConfig.COOKIE_DOMAIN,
      }),
    },
    crossSubDomainCookies: {
      enabled: !isDev,
      domain: authEnvConfig.COOKIE_DOMAIN,
    },
  },

  rateLimit: {
    mode: isDev ? 'TEST' : 'LIVE',
    enabled: true,
    interval: '2m',
    max: 10,
    customRules: {
      '/get-session': false,
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              id: generateUID('GLMU'),
            },
          };
        },
      },
    },
  },

  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ['google', 'facebook'],
    },
  },
});
