"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = require("@repo/service/config/cors");
const proxy_1 = __importDefault(require("./routes/proxy"));
const utils_1 = require("@repo/service/utils");
const actions_1 = require("@repo/service/utils/actions");
const env_1 = __importDefault(require("./config/env"));
const compression_1 = __importDefault(require("@repo/service/middleware/compression"));
const cookie_parser_1 = __importDefault(require("@repo/service/middleware/cookie-parser"));
const helmet_1 = __importDefault(require("@repo/service/middleware/helmet"));
const logger_1 = require("@repo/service/lib/logger");
const logger = (0, logger_1.createLogger)('API Gateway');
const app = (0, express_1.default)();
const PORT = env_1.default.PORT;
// trust proxy (important for reverse proxies)
app.set('trust proxy', 1);
// setup middlewares
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.createCors)({
    NODE_ENV: env_1.default.NODE_ENV,
}));
// parse JSON bodies
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// cookieParser is used to parse cookies attached to the client request object.
// compression is used to gzip responses, reducing bandwidth usage and improving performance.
app.use(compression_1.default);
app.use((0, cookie_parser_1.default)({}));
// setup proxy routes
app.use(proxy_1.default);
//Global error handler
app.use((error, req, res, next) => {
    logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        method: req.method,
    });
    if (!res.headersSent) {
        res
            .status(error.statusCode || 500)
            .json((0, utils_1.createErrorResponse)(error.message || 'Internal eror'));
    }
});
(async () => {
    try {
        app.listen(PORT, () => {
            logger.info(`API Gateway running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger.info(`Gateway URL: http://localhost:${PORT}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        logger.error('Failed to start server', {
            error: error.message,
            stack: error.stack,
        });
        process.exit(1);
    }
})();
// Graceful shutdown
process.on('SIGINT', actions_1.handleServerShutdown);
process.on('SIGTERM', actions_1.handleServerShutdown);
exports.default = app;
