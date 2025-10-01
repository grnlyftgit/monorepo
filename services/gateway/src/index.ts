import express from 'express';
import type { Express, Request, Response } from 'express';
import { createCors } from '@repo/service/config/cors';
import proxyRoutes from './routes/proxy';
import { createErrorResponse } from '@repo/service/utils';
import { handleServerShutdown } from '@repo/service/utils/actions';
import config from './config/env';
import compressionMiddleware from '@repo/service/middleware/compression';
import cookieParserMiddleware from '@repo/service/middleware/cookie-parser';
import limiter from '@repo/service/middleware/ratelimiter';
import createHelmetMiddleware from '@repo/service/middleware/helmet';
import { createLogger } from '@repo/service/lib/logger';

const logger = createLogger('API Gateway');

const app: Express = express();
const PORT = config.PORT;

// trust proxy (important for reverse proxies)
app.set('trust proxy', 1);

// setup middlewares
app.use(
  createHelmetMiddleware({
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  createCors({
    NODE_ENV: config.NODE_ENV,
  })
);

// parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all requests
app.use(limiter);


// cookieParser is used to parse cookies attached to the client request object.
// compression is used to gzip responses, reducing bandwidth usage and improving performance.
app.use(compressionMiddleware);
app.use(cookieParserMiddleware({}));

// setup proxy routes
app.use(proxyRoutes);

//Global error handler
app.use(
  (error: any, req: Request, res: Response, next: express.NextFunction) => {
    logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      method: req.method,
    });

    if (!res.headersSent) {
      res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message || 'Internal eror'));
    }
  }
);

(async () => {
  try {

    app.listen(PORT, () => {
      logger.info(`API Gateway running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Gateway URL: http://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error: any) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', handleServerShutdown);
process.on('SIGTERM', handleServerShutdown);

export default app;
