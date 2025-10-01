import { z } from "zod";
export interface validatorTypes {
    schema: z.ZodSchema<any>;
    body: any;
}
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    uptime?: string;
    error?: string;
    errors?: Record<string, string[]>;
}
export declare class ServiceError extends Error {
    statusCode: number;
    code?: string;
    details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare function logError(error: Error, context?: Record<string, any>): void;
//# sourceMappingURL=index.d.ts.map