import { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import {
  getServiceConfig,
  getActiveServices,
  ServiceConfig,
  SERVICE_DEFINITIONS,
} from '../config/services';
import { createLogger } from '@repo/service/lib/logger';
import type { Router as RouterType } from 'express';
import { formatTime } from '@repo/service/utils/actions';
import config from '../config/env';

const router: RouterType = Router();
const logger = createLogger('ProxyRouter');

// ============================================
// Types & Interfaces
// ============================================

interface ProxyOptions {
  serviceName: string;
  pathPrefix: string;
  pathRewrite: string;
}

// ============================================
// Middleware Functions
// ============================================

const requestTimer = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  (req as any).startTime = Date.now();
  next();
};

const rootRedirectMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.path === '/') {
    logger.info('Root path accessed');
    res.json({
      success: true,
      message: 'Welcome to the API Gateway',
      version: '1.0.0',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

const healthCheckMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.path === '/health') {
    const services = getActiveServices().map((s) => ({
      name: s.name,
      displayName: s.displayName,
      url: s.url,
      proxyPath: s.proxyPath,
      enabled: s.enabled,
    }));

    const uptime = formatTime(process.uptime());

    res.json({
      success: true,
      status: 'healthy',
      uptime,
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      gateway: {
        name: 'API Gateway',
        port: config.PORT,
        version: '1.0.0',
      },
      services: {
        total: services.length,
        active: services.filter((s) => s.enabled).length,
        list: services,
      },
    });
  }
  next();
};

// ============================================
// Error Handling
// ============================================

const handleProxyError = (
  err: any,
  req: Request,
  res: Response,
  serviceName?: string
): void => {
  const statusCode = err.statusCode || 503;
  const errorCode = (err as any)?.code;

  logger.error(`Proxy error for service: ${serviceName || 'unknown'}`, {
    error: err.message,
    code: errorCode,
    method: req.method,
    path: req.originalUrl,
    service: serviceName,
    statusCode,
  });

  if (!res.headersSent) {
    res.status(statusCode).json({
      success: false,
      error: 'Service Unavailable',
      message: getErrorMessage(errorCode),
      service: serviceName,
      timestamp: new Date().toISOString(),
    });
  }
};

const getErrorMessage = (code?: string): string => {
  const errorMessages: Record<string, string> = {
    ECONNREFUSED: 'Service is not responding. Please try again later.',
    ETIMEDOUT: 'Service request timed out. Please try again.',
    ENOTFOUND: 'Service could not be found.',
    ECONNRESET: 'Connection to service was reset.',
  };

  return (
    errorMessages[code || ''] ||
    'The requested service is temporarily unavailable. Please try again later.'
  );
};

// ============================================
// Proxy Creation
// ============================================

const createServiceProxy = (
  serviceConfig: ServiceConfig,
  pathRewrite: Record<string, string>
) => {
  const options: Options = {
    target: serviceConfig.url,
    changeOrigin: true,
    pathRewrite,
    timeout: serviceConfig.timeout,
    proxyTimeout: serviceConfig.timeout,
    logLevel: 'silent',

    onError: (err, req, res) => {
      logger.error(`Proxy error occurred`, {
        service: serviceConfig.name,
        error: err.message,
        code: (err as any)?.code,
        target: serviceConfig.url,
      });
      handleProxyError(
        err,
        req as Request,
        res as Response,
        serviceConfig.displayName
      );
    },

    onProxyReq: (proxyReq, req: Request) => {
      logger.http(`Proxying request to ${serviceConfig.displayName}`, {
        method: req.method,
        path: req.originalUrl,
        target: serviceConfig.url,
        service: serviceConfig.name,
        ip: req.ip || req.socket?.remoteAddress,
      });

      // Handle request body for POST/PUT/PATCH
      if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader(
          'Content-Length',
          Buffer.byteLength(bodyData).toString()
        );
        proxyReq.write(bodyData);

        logger.debug(`Request body forwarded`, {
          service: serviceConfig.name,
          method: req.method,
          bodySize: Buffer.byteLength(bodyData),
        });
      }
    },

    onProxyRes: (proxyRes, req: Request) => {
      const duration = Date.now() - ((req as any).startTime || Date.now());
      const statusCode = proxyRes.statusCode || 0;

      const logLevel =
        statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

      logger[logLevel](`Response from ${serviceConfig.displayName}`, {
        status: statusCode,
        method: req.method,
        path: req.originalUrl,
        duration: `${duration}ms`,
        service: serviceConfig.name,
        contentType: proxyRes.headers['content-type'],
      });

      // Add custom headers
      proxyRes.headers['X-Proxied-By'] = 'API-Gateway';
      proxyRes.headers['X-Service-Name'] = serviceConfig.name;
      proxyRes.headers['X-Response-Time'] = `${duration}ms`;
    },
  };

  return createProxyMiddleware(options);
};

// ============================================
// Service Registration
// ============================================

const registerServiceProxy = ({
  serviceName,
  pathPrefix,
  pathRewrite,
}: ProxyOptions): void => {
  const serviceConfig = getServiceConfig(serviceName);

  if (!serviceConfig) {
    logger.warn(`Service configuration not found`, {
      serviceName,
      pathPrefix,
    });
    return;
  }

  if (!serviceConfig.enabled) {
    logger.info(`Service is disabled, skipping proxy registration`, {
      serviceName,
      pathPrefix,
    });
    return;
  }

  const rewriteRule = { [`^${pathPrefix}`]: pathRewrite };

  const middlewares = [
    requestTimer,
    createServiceProxy(serviceConfig, rewriteRule),
  ];

  router.use(pathPrefix, ...middlewares);

  logger.debug(`Service proxy registered`, {
    service: serviceName,
    pathPrefix,
    target: serviceConfig.url,
  });
};

// ============================================
// Route Registration
// ============================================

// Root and health check routes
router.use(rootRedirectMiddleware);
router.use(healthCheckMiddleware);

// Build service routes from definitions
const serviceRoutes: ProxyOptions[] = Object.values(SERVICE_DEFINITIONS).map(
  (def) => ({
    serviceName: def.key,
    pathPrefix: def.proxyPath,
    pathRewrite: def.servicePath,
  })
);

// Register all service proxies
serviceRoutes.forEach(registerServiceProxy);

// Log initialization
logger.info(`API Gateway initialized successfully`, {
  totalServices: serviceRoutes.length,
  registeredServices: serviceRoutes.map((s) => s.serviceName),
  environment: config.NODE_ENV,
  port: config.PORT,
});

// ============================================
// Error Handlers
// ============================================

// 404 handler for undefined routes
router.use((req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip || req.socket?.remoteAddress,
  });

  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl,
    availableRoutes: serviceRoutes.map((s) => s.pathPrefix),
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
router.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error in proxy router`, {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
  });

  if (!res.headersSent) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Internal Server Error',
      message:
        config.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
