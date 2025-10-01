"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.createLogger = exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const LOG_COLORS = {
    error: chalk_1.default.red.bold,
    warn: chalk_1.default.yellow.bold,
    info: chalk_1.default.green.bold,
    http: chalk_1.default.magenta.bold,
    debug: chalk_1.default.blue.bold,
};
// Hardcoded logs directory
const logDir = path_1.default.resolve("logs");
// Create logs directory if it doesn't exist
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
    console.log(`Created log directory: ${logDir}`);
}
// Optimal log level for production use
const getLogLevel = () => {
    return 'debug';
};
class CustomFormatter {
    colorize;
    constructor(colorize = true) {
        this.colorize = colorize;
    }
    format(info) {
        const { timestamp, level, message, context, service, stack, ...meta } = info;
        const levelColor = LOG_COLORS[level] || chalk_1.default.white;
        const timestampColor = chalk_1.default.gray;
        const contextColor = chalk_1.default.cyan;
        const serviceColor = chalk_1.default.magentaBright;
        const metaColor = chalk_1.default.gray;
        const stackColor = chalk_1.default.red;
        let logMessage = "";
        if (this.colorize) {
            logMessage += `${timestampColor(timestamp)} `;
            logMessage += `${levelColor(`[${level.toUpperCase()}]`)} `;
            if (context) {
                logMessage += `${contextColor(`[${context}]`)} `;
            }
            if (service) {
                logMessage += `${serviceColor(`{${service}}`)} `;
            }
            logMessage += chalk_1.default.white(stack || message);
            const cleanMeta = { ...meta };
            delete cleanMeta.timestamp;
            delete cleanMeta.level;
            delete cleanMeta.message;
            if (Object.keys(cleanMeta).length > 0) {
                logMessage += `\n${metaColor(JSON.stringify(cleanMeta, null, 2))}`;
            }
            if (stack && !this.colorize) {
                logMessage += `\n${stackColor(stack)}`;
            }
        }
        else {
            logMessage += `${timestamp} [${level.toUpperCase()}]`;
            if (context)
                logMessage += ` [${context}]`;
            if (service)
                logMessage += ` {${service}}`;
            logMessage += ` ${stack || message}`;
            const cleanMeta = { ...meta };
            delete cleanMeta.timestamp;
            delete cleanMeta.level;
            delete cleanMeta.message;
            if (Object.keys(cleanMeta).length > 0) {
                logMessage += ` ${JSON.stringify(cleanMeta)}`;
            }
        }
        return logMessage;
    }
}
const customFormat = (colorize = true) => {
    const formatter = new CustomFormatter(colorize);
    return winston_1.default.format.printf((info) => formatter.format(info));
};
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), customFormat(true));
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Daily rotate file transport for general logs
const dailyRotateFileTransport = new winston_daily_rotate_file_1.default({
    filename: `${logDir}/%DATE%-results.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: fileFormat,
    level: getLogLevel(),
});
// Error-only logs with longer retention
const errorRotateFileTransport = new winston_daily_rotate_file_1.default({
    filename: `${logDir}/%DATE%-error.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    level: "error",
    format: fileFormat,
});
// Combined logs with larger file size for comprehensive logging
const combinedRotateFileTransport = new winston_daily_rotate_file_1.default({
    filename: `${logDir}/%DATE%-combined.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "50m",
    maxFiles: "14d",
    format: fileFormat,
    level: getLogLevel(),
});
const logTransports = [
    new winston_1.default.transports.Console({
        level: getLogLevel(),
        format: consoleFormat,
    }),
    dailyRotateFileTransport,
    combinedRotateFileTransport,
    errorRotateFileTransport,
];
const baseLogger = winston_1.default.createLogger({
    level: getLogLevel(),
    levels: LOG_LEVELS,
    transports: logTransports,
    exceptionHandlers: [
        new winston_daily_rotate_file_1.default({
            filename: `${logDir}/%DATE%-exceptions.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
            format: fileFormat,
        }),
    ],
    rejectionHandlers: [
        new winston_daily_rotate_file_1.default({
            filename: `${logDir}/%DATE%-rejections.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
            format: fileFormat,
        }),
    ],
    exitOnError: false,
});
class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    log(level, message, meta) {
        baseLogger.log(level, message, {
            context: this.context,
            ...meta,
        });
    }
    debug(message, meta) {
        this.log("debug", message, meta);
    }
    info(message, meta) {
        this.log("info", message, meta);
    }
    http(message, meta) {
        this.log("http", message, meta);
    }
    warn(message, meta) {
        this.log("warn", message, meta);
    }
    error(message, meta) {
        this.log("error", message, meta);
    }
    child(service) {
        const childLogger = new Logger(this.context);
        childLogger.log = (level, message, meta) => {
            baseLogger.log(level, message, {
                context: this.context,
                service,
                ...meta,
            });
        };
        return childLogger;
    }
}
exports.Logger = Logger;
const createLogger = (context) => {
    return new Logger(context);
};
exports.createLogger = createLogger;
const requestLogger = (req, res, next) => {
    const logger = (0, exports.createLogger)("HTTP");
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 500
            ? chalk_1.default.red
            : res.statusCode >= 400
                ? chalk_1.default.yellow
                : res.statusCode >= 300
                    ? chalk_1.default.cyan
                    : chalk_1.default.green;
        const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "http";
        logger[level](`${req.method} ${req.originalUrl} ${statusColor(res.statusCode)} ${duration}ms`, {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get("user-agent"),
            userId: req.user?.userId,
        });
    });
    next();
};
exports.requestLogger = requestLogger;
exports.default = baseLogger;
