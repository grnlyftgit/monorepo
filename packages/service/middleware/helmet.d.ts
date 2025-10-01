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
declare function createHelmetMiddleware(options?: HelmetCSPOptions): RequestHandler;
export declare const strictHelmetMiddleware: RequestHandler;
export declare const devHelmetMiddleware: RequestHandler;
export default createHelmetMiddleware;
//# sourceMappingURL=helmet.d.ts.map