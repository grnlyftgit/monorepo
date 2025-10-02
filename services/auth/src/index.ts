import express from 'express';
import dotenv from 'dotenv';
import type { Express } from 'express';
import authEnvConfig from './config/env';
import { createLogger } from '@repo/service/lib/logger';
import { errorHandler, rootAccessCheck } from '@repo/service/middleware';
import { healthCheck } from '@repo/service/middleware/healthcheck';
import compressionMiddleware from '@repo/service/middleware/compression';
import cookieParserMiddleware from '@repo/service/middleware/cookie-parser';
import { createCors } from '@repo/service/config/cors';
import createHelmetMiddleware from '@repo/service/middleware/helmet';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import limiter from '@repo/service/middleware/ratelimiter';

dotenv.config();

const app: Express = express();
const PORT = authEnvConfig.PORT;
const logger = createLogger('Auth Service');

const serviceName = authEnvConfig.SERVICE_NAME;

app.use(
  createCors({
    NODE_ENV: authEnvConfig.NODE_ENV,
  })
);

app.use(
  createHelmetMiddleware({
    enableScalar: true,
    nodeEnv: authEnvConfig.NODE_ENV,
  })
);

// parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compressionMiddleware);
app.use(cookieParserMiddleware({}));

// Error handling middleware
app.use(errorHandler);

// Rate Limiter
app.use(limiter);

// API routes
app.get(
  '/',
  rootAccessCheck({
    serviceName: `${serviceName}`,
    port: PORT,
    docs: '/docs',
  })
);

app.get(
  '/health',
  healthCheck({
    port: PORT,
    serviceName: `${authEnvConfig.SERVICE_NAME}`,
    version: 'v1',
  })
);

app.all('/*splat', toNodeHandler(auth)); // Better Auth Route Handler

app.listen(PORT, () => {
  logger.info(`${serviceName} service is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
