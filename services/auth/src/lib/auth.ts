import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from '@repo/db-neon/src';
import authEnvConfig from '../config/env';
import { emailOTP, openAPI, phoneNumber } from 'better-auth/plugins';
import { siteData } from '@repo/seo/metadata';
import config from '@repo/service/config/env';
import { createLogger } from '@repo/service/lib/logger';
import { generateUID } from '@repo/service/utils/private/uid-generator';
import { PasswordUtils } from '@repo/service/utils/private/hash-passowrd';

const logger = createLogger('BetterAuth');

const isDev = authEnvConfig.NODE_ENV === 'development';

export const auth = betterAuth({
  appName: siteData.name,
  baseURL: authEnvConfig.BETTER_AUTH_URL,
  telemetry: { enabled: false },
  basePath: '/',
  secret: authEnvConfig.BETTER_AUTH_SECRET,
  trustedOrigins: config.CORS_WHITELISTED_ORIGINS,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
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
  plugins: [
    openAPI({
      path: '/docs',
    }),
    phoneNumber({
      sendOTP: ({ phoneNumber, code }, request) => {
        logger.info(`Sending OTP ${code} to phone number ${phoneNumber}`);
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber}@my-site.com`;
        },
        getTempName: (phoneNumber) => {
          return phoneNumber;
        },
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'sign-in') {
          logger.info(`Sending OTP ${otp} to email ${email}`);

          //TODO : Integrate real email service
        } else if (type === 'email-verification') {
          logger.info(`Sending OTP ${otp} to email ${email}`);
          //TODO : Integrate real email service
        } else {
          logger.info(`Sending OTP ${otp} to email ${email}`);
          //TODO : Integrate real email service
        }
      },
    }),
  ],

  rateLimit: {
    mode: isDev ? 'TEST' : 'LIVE',
    enabled: true,
    interval: '2m',
    max: 10,
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
});
