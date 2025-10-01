import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import config from "../config/env";

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const LOG_COLORS = {
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.green.bold,
  http: chalk.magenta.bold,
  debug: chalk.blue.bold,
};

// Hardcoded logs directory
const logDir = path.resolve("logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log(`Created log directory: ${logDir}`);
}

// Optimal log level for production use
const getLogLevel = (): string => {
  return 'debug';
};

class CustomFormatter {
  private colorize: boolean;

  constructor(colorize: boolean = true) {
    this.colorize = colorize;
  }

  format(info: winston.Logform.TransformableInfo): string {
    const { timestamp, level, message, context, service, stack, ...meta } =
      info;

    const levelColor =
      LOG_COLORS[level as keyof typeof LOG_COLORS] || chalk.white;
    const timestampColor = chalk.gray;
    const contextColor = chalk.cyan;
    const serviceColor = chalk.magentaBright;
    const metaColor = chalk.gray;
    const stackColor = chalk.red;

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

      logMessage += chalk.white(stack || message);

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
    } else {
      logMessage += `${timestamp} [${level.toUpperCase()}]`;
      if (context) logMessage += ` [${context}]`;
      if (service) logMessage += ` {${service}}`;
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

const customFormat = (colorize: boolean = true) => {
  const formatter = new CustomFormatter(colorize);
  return winston.format.printf((info) => formatter.format(info));
};

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  customFormat(true)
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Daily rotate file transport for general logs
const dailyRotateFileTransport = new DailyRotateFile({
  filename: `${logDir}/%DATE%-results.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: fileFormat,
  level: getLogLevel(),
});

// Error-only logs with longer retention
const errorRotateFileTransport = new DailyRotateFile({
  filename: `${logDir}/%DATE%-error.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  level: "error",
  format: fileFormat,
});

// Combined logs with larger file size for comprehensive logging
const combinedRotateFileTransport = new DailyRotateFile({
  filename: `${logDir}/%DATE%-combined.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "50m",
  maxFiles: "14d",
  format: fileFormat,
  level: getLogLevel(),
});

const logTransports: winston.transport[] = [
  new winston.transports.Console({
    level: getLogLevel(),
    format: consoleFormat,
  }),
  dailyRotateFileTransport,
  combinedRotateFileTransport,
  errorRotateFileTransport,
];

const baseLogger = winston.createLogger({
  level: getLogLevel(),
  levels: LOG_LEVELS,
  transports: logTransports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: `${logDir}/%DATE%-exceptions.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
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

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(
    level: string,
    message: string,
    meta?: Record<string, any>
  ): void {
    baseLogger.log(level, message, {
      context: this.context,
      ...meta,
    });
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.log("info", message, meta);
  }

  http(message: string, meta?: Record<string, any>): void {
    this.log("http", message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: Record<string, any>): void {
    this.log("error", message, meta);
  }

  child(service: string): Logger {
    const childLogger = new Logger(this.context);
    childLogger.log = (
      level: string,
      message: string,
      meta?: Record<string, any>
    ) => {
      baseLogger.log(level, message, {
        context: this.context,
        service,
        ...meta,
      });
    };
    return childLogger;
  }
}

export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

export const requestLogger = (req: any, res: any, next: any): void => {
  const logger = createLogger("HTTP");
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 500
        ? chalk.red
        : res.statusCode >= 400
        ? chalk.yellow
        : res.statusCode >= 300
        ? chalk.cyan
        : chalk.green;

    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "http";

    logger[level](
      `${req.method} ${req.originalUrl} ${statusColor(
        res.statusCode
      )} ${duration}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
        userId: (req as any).user?.userId,
      }
    );
  });

  next();
};


export default baseLogger;
