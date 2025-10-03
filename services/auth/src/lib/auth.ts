import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { neonDB } from '@repo/db-neon/src';
import authEnvConfig from '../config/env';
import {
  admin,
  emailOTP,
  haveIBeenPwned,
  openAPI,
  phoneNumber,
} from 'better-auth/plugins';
import { siteData } from '@repo/seo/metadata';
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
  trustedOrigins: authEnvConfig.CORS_WHITELISTED_ORIGINS,
  database: drizzleAdapter(neonDB, {
    provider: 'pg',
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session,
      verification: schema.verification,
      passkey: schema.passkey,
    },
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
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: authEnvConfig.GOOGLE_CLIENT_ID,
      clientSecret: authEnvConfig.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    openAPI({ path: '/docs' }),
    passkey(),
    haveIBeenPwned({
      customPasswordCompromisedMessage: 'Please enter a more secure password.',
    }),
    admin({
      defaultRole: 'USER',
    }),

    // PHONE NUMBER PLUGIN - Handles OTP send/verify and auto account creation/login
    phoneNumber({
      requireVerification: false, // Set to false to allow both new signups and existing user logins
      allowedAttempts: 5,
      otpLength: 6,
      expiresIn: 600, // 10 min
      sendOTP: ({ phoneNumber, code }) => {
        logger.info(`Sending OTP ${code} to phone number ${phoneNumber}`);
        // TODO: Integrate your SMS gateway here to send OTP
      },

      // This enables auto account creation on phone verification for NEW users
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          const domain =
            authEnvConfig.COOKIE_DOMAIN?.replace(/^\./, '') ?? 'example.com';
          return `${phoneNumber}@${domain}`;
        },
        getTempName: () => {
          return generateRandomUsername();
        },
      },

      callbackOnVerification: async ({ phoneNumber, user }, request) => {
        logger.info(
          `Phone verified for user: ${user.id}, phone: ${phoneNumber}`
        );
        try {
          await neonDB
            .insert(schema.account)
            .values({
              id: generateUID('GLMA'),
              accountId: user.id,
              providerId: 'phone',
              userId: user.id,
            })
            .execute();
          logger.info(
            `Account created for user ${user.id} with phone ${phoneNumber}`
          );
        } catch (error) {
          logger.error(
            `Failed to create account for user ${user.id}: ${error}`
          );
        }
      },
    }),

    // EMAIL OTP PLUGIN - Handles email verification via OTP
    emailOTP({
      allowedAttempts: 5,
      otpLength: 6,
      expiresIn: 600, // 10 min

      // CRITICAL: This makes email verification use OTP instead of magic links
      overrideDefaultEmailVerification: true,

      // This will NOT auto-send OTP on signup (you'll trigger it manually when updating email)
      sendVerificationOnSignUp: false,

      async sendVerificationOTP({ email, otp, type }) {
        logger.info(`Sending email OTP ${otp} to ${email} for type ${type}`);
        // TODO: Integrate your email service to send email OTP here
      },
    }),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to false since we handle verification manually
    autoSignInAfterVerification: true,
    autoSignIn: true,
    password: {
      hash: async (password) => {
        return await PasswordUtils.hash(password, authEnvConfig.HASH_SECRET);
      },
      verify: async ({ password, hash }) => {
        return await PasswordUtils.verify(
          password,
          hash,
          authEnvConfig.HASH_SECRET
        );
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day
    },
  },

  advanced: {
    cookiePrefix: authEnvConfig.COOKIE_PREFIX,
    disableCSRFCheck: isDev,
    cookies: {
      session_token: {
        name: authEnvConfig.COOKIE_SESSION_TOKEN_NAME,
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
    account: {
      create: {
        before: async (accountData) => {
          return {
            data: {
              ...accountData,
              id: generateUID('GLMA'),
            },
          };
        },
      },
    },
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
      requireEmailVerification: true, // This triggers email OTP when email is changed
    },
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'USER',
        input: false,
      },
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
