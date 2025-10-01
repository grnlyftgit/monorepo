import helmet from 'helmet';
import type { RequestHandler } from 'express';

interface HelmetCSPOptions {
  enableScalar?: boolean;
  allowedScriptSources?: string[];
  allowedStyleSources?: string[];
  allowedConnectSources?: string[];
  contentSecurityPolicy?: boolean;
  crossOriginEmbedderPolicy?: boolean;
  nodeEnv?: string;
}

function createHelmetMiddleware(
  options: HelmetCSPOptions = {}
): RequestHandler {
  const {
    enableScalar = true,
    allowedScriptSources = [],
    allowedStyleSources = [],
    allowedConnectSources = [],
    nodeEnv = process.env.NODE_ENV || 'development',
  } = options;

  const isDevelopment = nodeEnv === 'development';

  // Base CSP directives
  const baseScriptSrc = ["'self'"];
  const baseStyleSrc = ["'self'"];
  const baseFontSrc = ["'self'", 'data:'];
  const baseImgSrc = ["'self'", 'data:', 'blob:'];
  const baseConnectSrc = ["'self'"];

  // Add Scalar-specific sources if enabled
  if (enableScalar) {
    baseScriptSrc.push(
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com'
    );

    baseStyleSrc.push(
      "'unsafe-inline'",
      'https://cdn.jsdelivr.net',
      'https://fonts.googleapis.com'
    );

    baseFontSrc.push('https://fonts.gstatic.com', 'https://cdn.jsdelivr.net');

    baseImgSrc.push('https:');

    baseConnectSrc.push('https://cdn.jsdelivr.net');
  }

  // Merge custom sources
  const scriptSrc = [...baseScriptSrc, ...allowedScriptSources];
  const styleSrc = [...baseStyleSrc, ...allowedStyleSources];
  const connectSrc = [...baseConnectSrc, ...allowedConnectSources];

  return helmet({
    contentSecurityPolicy:
      options.contentSecurityPolicy ?? true
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
  }) as RequestHandler;
}

export const strictHelmetMiddleware: RequestHandler = createHelmetMiddleware({
  enableScalar: false,
  nodeEnv: 'production',
});

export const devHelmetMiddleware: RequestHandler = createHelmetMiddleware({
  enableScalar: true,
  nodeEnv: 'development',
});

export default createHelmetMiddleware;
