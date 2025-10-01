"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_1 = __importDefault(require("./config/env"));
const logger_1 = require("@repo/service/lib/logger");
const middleware_1 = require("@repo/service/middleware");
const healthcheck_1 = require("@repo/service/middleware/healthcheck");
const compression_1 = __importDefault(require("@repo/service/middleware/compression"));
const cookie_parser_1 = __importDefault(require("@repo/service/middleware/cookie-parser"));
const cors_1 = require("@repo/service/config/cors");
const helmet_1 = __importDefault(require("@repo/service/middleware/helmet"));
const node_1 = require("better-auth/node");
const auth_1 = require("./lib/auth");
//load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = env_1.default.PORT;
const logger = (0, logger_1.createLogger)('Auth Service');
const serviceName = env_1.default.SERVICE_NAME;
// setup middlewares
app.use((0, cors_1.createCors)({
    NODE_ENV: env_1.default.NODE_ENV,
}));
// Configure Helmet with proper CSP for Scalar API Reference
app.use((0, helmet_1.default)({
    enableScalar: true,
    nodeEnv: env_1.default.NODE_ENV,
}));
// parse JSON bodies
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(compression_1.default);
app.use((0, cookie_parser_1.default)({}));
// API routes
app.get('/', (0, healthcheck_1.rootAccessCheck)({ serviceName: `${serviceName}`, port: PORT }));
app.all('/v1/*splat', (0, node_1.toNodeHandler)(auth_1.auth)); // Better Auth Route Handler
app.get('/health', (0, healthcheck_1.healthCheck)({ port: PORT, serviceName: `${serviceName}`, version: 'v1' }));
// Error handling middleware
app.use(middleware_1.errorHandler);
app.listen(PORT, () => {
    logger.info(`${serviceName} service is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
