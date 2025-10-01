import express from 'express';
import dotenv from 'dotenv';
import type { Express } from 'express';
import userEnvConfig from './config/env';
import { createLogger } from '@repo/service/lib/logger';
import { errorHandler , rootAccessCheck} from '@repo/service/middleware';
import {
  healthCheck,
} from '@repo/service/middleware/healthcheck';
import compressionMiddleware from '@repo/service/middleware/compression';
import cookieParserMiddleware from '@repo/service/middleware/cookie-parser';
import createHelmetMiddleware from '@repo/service/middleware/helmet';
import { createCors } from '@repo/service/config/cors';

//load environment variables
dotenv.config();

const app: Express = express();
const PORT = userEnvConfig.PORT;
const logger = createLogger(`${userEnvConfig.SERVICE_NAME} Service`);

// setup middlewares
app.use(
  createCors({
    NODE_ENV: userEnvConfig.NODE_ENV,
  })
);
app.use(
  createHelmetMiddleware({
    contentSecurityPolicy: false,
  })
);

// parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compressionMiddleware);
app.use(cookieParserMiddleware({}));

// API routes
app.get(
  '/',
  rootAccessCheck({ serviceName: `${userEnvConfig.SERVICE_NAME}`, port: PORT })
);

app.get(
  '/health',
  healthCheck({
    port: PORT,
    serviceName: `${userEnvConfig.SERVICE_NAME}`,
    version: 'v1',
  })
);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(
    `${userEnvConfig.SERVICE_NAME} service is running on port ${PORT}`
  );
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
