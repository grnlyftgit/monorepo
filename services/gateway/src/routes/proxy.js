"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const services_1 = require("../config/services");
const logger_1 = require("@repo/service/lib/logger");
const actions_1 = require("@repo/service/utils/actions");
const env_1 = __importDefault(require("../config/env"));
const router = (0, express_1.Router)();
const logger = (0, logger_1.createLogger)('ProxyRouter');
const handleProxyError = (err, req, res, serviceName) => {
    logger.error(`Proxy error for service: ${serviceName || 'unknown'}`, {
        error: err.message,
        code: err?.code,
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
            message: 'The requested service is temporarily unavailable. Please try again later.',
            service: serviceName,
            timestamp: new Date().toISOString(),
        });
    }
};
const createServiceProxy = (config, pathRewrite) => {
    const options = {
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
                code: err?.code,
                target: config.url,
            });
            handleProxyError(err, req, res, config.name);
        },
        onProxyReq: (proxyReq, req) => {
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
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData).toString());
                proxyReq.write(bodyData);
                logger.debug(`Request body forwarded`, {
                    service: config.name,
                    method: req.method,
                    bodySize: Buffer.byteLength(bodyData),
                });
            }
        },
        onProxyRes: (proxyRes, req) => {
            const duration = Date.now() - (req.startTime || Date.now());
            const statusCode = proxyRes.statusCode || 0;
            const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
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
    return (0, http_proxy_middleware_1.createProxyMiddleware)(options);
};
const requestTimer = (req, res, next) => {
    req.startTime = Date.now();
    next();
};
// Root redirect middleware
const rootRedirectMiddleware = (req, res, next) => {
    if (req.path === '/') {
        logger.info('Root path accessed, redirecting to website');
        return res.redirect(env_1.default.WEBSITE_URL);
    }
    next();
};
const healthCheckMiddleware = (req, res, next) => {
    if (req.path === '/health') {
        const services = (0, services_1.getActiveServices)().map((s) => ({
            name: s.name,
            url: s.url,
            enabled: s.enabled,
        }));
        const uptime = (0, actions_1.formatTime)(process.uptime());
        return res.json({
            success: true,
            status: 'healthy',
            uptime,
            timestamp: new Date().toISOString(),
            gateway: `API Gateway - PORT: ${env_1.default.PORT}`,
            services,
        });
    }
    next();
};
const registerServiceProxy = ({ serviceName, pathPrefix, pathRewrite, }) => {
    const serviceConfig = (0, services_1.getServiceConfig)(serviceName);
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
    const middlewares = [
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
const serviceRoutes = [
    {
        serviceName: 'auth',
        pathPrefix: '/api/auth',
        pathRewrite: '/',
    },
    {
        serviceName: 'user',
        pathPrefix: '/api/user',
        pathRewrite: '/',
    }
];
// Register all service proxies
serviceRoutes.forEach(registerServiceProxy);
// Log once after all services are registered
logger.info(`API Gateway initialized successfully`, {
    totalServices: serviceRoutes.length,
    registeredServices: serviceRoutes.map((s) => s.serviceName),
    port: env_1.default.PORT,
});
// 404 handler for undefined routes
router.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`
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
router.use((err, req, res, next) => {
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
exports.default = router;
