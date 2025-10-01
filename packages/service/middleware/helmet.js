"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devHelmetMiddleware = exports.strictHelmetMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
function createHelmetMiddleware(options = {}) {
    const { enableScalar = true, allowedScriptSources = [], allowedStyleSources = [], allowedConnectSources = [], nodeEnv = process.env.NODE_ENV || 'development', } = options;
    const isDevelopment = nodeEnv === 'development';
    // Base CSP directives
    const baseScriptSrc = ["'self'"];
    const baseStyleSrc = ["'self'"];
    const baseFontSrc = ["'self'", 'data:'];
    const baseImgSrc = ["'self'", 'data:', 'blob:'];
    const baseConnectSrc = ["'self'"];
    // Add Scalar-specific sources if enabled
    if (enableScalar) {
        baseScriptSrc.push("'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com');
        baseStyleSrc.push("'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com');
        baseFontSrc.push('https://fonts.gstatic.com', 'https://cdn.jsdelivr.net');
        baseImgSrc.push('https:');
        baseConnectSrc.push('https://cdn.jsdelivr.net');
    }
    // Merge custom sources
    const scriptSrc = [...baseScriptSrc, ...allowedScriptSources];
    const styleSrc = [...baseStyleSrc, ...allowedStyleSources];
    const connectSrc = [...baseConnectSrc, ...allowedConnectSources];
    return (0, helmet_1.default)({
        contentSecurityPolicy: options.contentSecurityPolicy ?? true
            ? {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc,
                    styleSrc,
                    fontSrc: baseFontSrc,
                    imgSrc: baseImgSrc,
                    connectSrc,
                    objectSrc: ["'none'"],
                    frameAncestors: ["'none'"],
                    baseUri: ["'self'"],
                    formAction: ["'self'"],
                    upgradeInsecureRequests: [],
                },
            }
            : false,
        crossOriginEmbedderPolicy: enableScalar
            ? false
            : true
                ? options.crossOriginEmbedderPolicy ?? true
                : false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        // Disable HSTS in development
        hsts: isDevelopment
            ? false
            : {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
    });
}
exports.strictHelmetMiddleware = createHelmetMiddleware({
    enableScalar: false,
    nodeEnv: 'production',
});
exports.devHelmetMiddleware = createHelmetMiddleware({
    enableScalar: true,
    nodeEnv: 'development',
});
exports.default = createHelmetMiddleware;
