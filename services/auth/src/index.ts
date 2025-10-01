import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import type { Express } from 'express';
import authEnvConfig from './config/env';
import { createLogger } from '@repo/service/lib/logger';
import { errorHandler } from '@repo/service/middleware';
import { healthCheck } from '@repo/service/middleware/healthcheck';
import compressionMiddleware from '@repo/service/middleware/compression';
import cookieParserMiddleware from '@repo/service/middleware/cookie-parser';
import { createCors } from '@repo/service/config/cors';

//load environment variables
dotenv.config();

const app: Express = express();
const PORT = authEnvConfig.PORT;
const logger = createLogger('Auth Service');

// setup middlewares
app.use(
  createCors({
    NODE_ENV: authEnvConfig.NODE_ENV,
  })
);
app.use(helmet());

// parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compressionMiddleware);
app.use(cookieParserMiddleware({}));

// API routes
// app.use("/auth", authRoutes);
app.get('/', (req, res) => {
  res.send('Welcome to the Auth Service');
});
app.get(
  '/health',
  healthCheck({ port: PORT, serviceName: 'Auth Service', version: 'v1' })
);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Auth service is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
