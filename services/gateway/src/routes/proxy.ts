import { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import {
  getServiceConfig,
  getActiveServices,
  ServiceConfig,
} from '../config/services';
import { createLogger } from '@repo/service/lib/logger';
import type { Router as RouterType } from 'express';
import { formatTime } from '@repo/service/utils/actions';
import config from '../config/env';

const router: RouterType = Router();
const logger = createLogger('ProxyRouter');

interface ProxyOptions {
  serviceName: string;
  pathPrefix: string;
  pathRewrite?: string;
}

const handleProxyError = (
  err: any,
  req: Request,
  res: Response,
  serviceName?: string
): void => {
  logger.error(`Proxy error for service: ${serviceName || 'unknown'}`, {
    error: err.message,
    code: (err as any)?.code,
    method: req.method,
    path: req.originalUrl,
    service: serviceName,
    statusCode: err.statusCode || 503,
  });

  if (!res.headersSent) {
    const statusCode = err.statusCode || 503;
    res.status(statusCode).json({
      success: false,
      error: 'Service unavailable',
      message:
        'The requested service is temporarily unavailable. Please try again later.',
      service: serviceName,
      timestamp: new Date().toISOString(),
    });
  }
};

const createServiceProxy = (
  config: ServiceConfig,
  pathRewrite?: Record<string, string>
) => {
  const options: Options = {
    target: config.url,
    changeOrigin: true,
    pathRewrite: pathRewrite || {},
    timeout: config.timeout || 30000,
    proxyTimeout: config.timeout || 30000,
    logLevel: 'silent',

    onError: (err, req, res) => {
      logger.error(`Proxy error occurred`, {
        service: config.name,
        error: err.message,
        code: (err as any)?.code,
        target: config.url,
      });
      handleProxyError(err, req as Request, res as Response, config.name);
    },

    onProxyReq: (proxyReq, req: Request) => {
      logger.http(`Proxying request to ${config.name}`, {
        method: req.method,
        path: req.originalUrl,
        target: config.url,
        service: config.name,
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
          service: config.name,
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

      logger[logLevel](`Response from ${config.name}`, {
        status: statusCode,
        method: req.method,
        path: req.originalUrl,
        duration: `${duration}ms`,
        service: config.name,
        contentType: proxyRes.headers['content-type'],
      });

      // Add custom headers
      proxyRes.headers['X-Proxied-By'] = 'API-Gateway';
      proxyRes.headers['X-Service-Name'] = config.name;
      proxyRes.headers['X-Response-Time'] = `${duration}ms`;
    },
  };

  return createProxyMiddleware(options);
};

const requestTimer = (req: Request, res: Response, next: NextFunction) => {
  (req as any).startTime = Date.now();
  next();
};

// Root redirect middleware
const rootRedirectMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path === '/') {
    logger.info('Root path accessed, redirecting to website');
    return res.json({
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
) => {
  if (req.path === '/health') {
    const services = getActiveServices().map((s) => ({
      name: s.name,
      displayName: s.displayName,
      url: s.url,
      proxyPath: s.proxyPath,
      enabled: s.enabled,
    }));
    const uptime = formatTime(process.uptime());

    return res.json({
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

const registerServiceProxy = ({
  serviceName,
  pathPrefix,
  pathRewrite,
}: ProxyOptions) => {
  const serviceConfig = getServiceConfig(serviceName);

  if (!serviceConfig) {
    logger.warn(`Service configuration not found`, {
      serviceName,
      pathPrefix,
    });
    return;
  }

  if (serviceConfig.enabled === false) {
    logger.info(`Service is disabled, skipping proxy registration`, {
      serviceName,
      pathPrefix,
    });
    return;
  }

  const rewriteRule = pathRewrite
    ? { [`^${pathPrefix}`]: pathRewrite }
    : { [`^${pathPrefix}`]: '' };

  const middlewares: any[] = [
    requestTimer,
    createServiceProxy(serviceConfig, rewriteRule),
  ];

  router.use(pathPrefix, ...middlewares);
};

// Root redirect
router.use(rootRedirectMiddleware);

// Health check middleware
router.use(healthCheckMiddleware);

// Service routes configuration
const serviceRoutes: ProxyOptions[] = [
  {
    serviceName: 'auth',
    pathPrefix: '/api/auth',
    pathRewrite: '/',
  },
  {
    serviceName: 'user',
    pathPrefix: '/api/user',
    pathRewrite: '/',
  },
];

// Register all service proxies
serviceRoutes.forEach(registerServiceProxy);

// Log once after all services are registered
logger.info(`API Gateway initialized successfully`, {
  totalServices: serviceRoutes.length,
  registeredServices: serviceRoutes.map((s) => s.serviceName),
  port: config.PORT,
});

// 404 handler for undefined routes
router.use((req: Request, res: Response) => {
  logger.warn(
    `Route not found: ${req.method} ${req.originalUrl}`

    //   , {
    //   ip: req.ip || req.socket?.remoteAddress,
    // }
  );

  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler for router
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
      message: err.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
