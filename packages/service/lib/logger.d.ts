import winston from "winston";
declare const baseLogger: winston.Logger;
export declare class Logger {
    private context;
    constructor(context: string);
    private log;
    debug(message: string, meta?: Record<string, any>): void;
    info(message: string, meta?: Record<string, any>): void;
    http(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
    child(service: string): Logger;
}
export declare const createLogger: (context: string) => Logger;
export declare const requestLogger: (req: any, res: any, next: any) => void;
export default baseLogger;
//# sourceMappingURL=logger.d.ts.map