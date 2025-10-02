import cors, { CorsOptions } from 'cors';
import { createLogger } from '../lib/logger';

const logger = createLogger('CORS Config');

interface CreateCorsOptions {
  NODE_ENV: 'development' | 'production';
  allowedOrigins?: string[];
}

// Custom CORS error class for better error handling
export class CorsError extends Error {
  statusCode: number;
  origin?: string;

  constructor(message: string, origin?: string) {
    super(message);
    this.name = 'CorsError';
    this.statusCode = 403;
    this.origin = origin;
  }
}

export function createCors(options: CreateCorsOptions) {
  const { NODE_ENV, allowedOrigins } = options;

  if (NODE_ENV === 'development') {
    logger.info('CORS: Development mode - allowing all origins');
    return cors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200,
    });
  } else {
    // In production, whitelist origins must be present
    if (!allowedOrigins || allowedOrigins.length === 0) {
      logger.error('CORS whitelisted origins are not set in production');
      throw new Error('CORS whitelisted origins must be set in production');
    }

    logger.info('CORS: Production mode', {
      allowedOrigins: allowedOrigins.join(', '),
    });

    return createCorsMiddleware(allowedOrigins);
  }
}

export function createCorsMiddleware(allowedOrigins: string[]) {
  const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
      // Allow non-browser tools / internal requests with no origin
      // (e.g., Postman, curl, server-to-server requests)
      if (!origin) {
        logger.debug('CORS request with no origin - allowing');
        return callback(null, true);
      }

      // Normalize origin (remove trailing slash)
      const normalizedOrigin = origin.replace(/\/$/, '');
      const normalizedAllowedOrigins = allowedOrigins.map((o) =>
        o.replace(/\/$/, '')
      );

      if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
        logger.debug(`CORS origin allowed: ${origin}`);
        return callback(null, true);
      } else {
        logger.warn(`CORS origin denied: ${origin}`, {
          allowedOrigins: normalizedAllowedOrigins,
        });
        return callback(
          new CorsError('Origin not allowed by CORS policy', origin)
        );
      }
    },
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 200, // For legacy browsers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Number'], // Headers accessible to client
    maxAge: 86400, // Cache preflight requests for 24 hours
  };

  return cors(corsOptions);
}
