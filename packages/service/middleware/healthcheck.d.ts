import { Request, Response } from 'express';
interface rootAccessMiddlewareProps {
    serviceName: string;
    port: number;
}
interface healthCheckMiddlewareProps {
    port: number;
    serviceName: string;
    version?: string;
}
export declare const rootAccessCheck: ({ serviceName, port, }: rootAccessMiddlewareProps) => (_: Request, res: Response) => Response<any, Record<string, any>>;
export declare const healthCheck: ({ port, serviceName, version, }: healthCheckMiddlewareProps) => (_: Request, res: Response) => Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=healthcheck.d.ts.map