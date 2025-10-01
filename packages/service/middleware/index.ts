import type { NextFunction, Request, Response } from 'express';
import { logError, ServiceError } from '../types';
import { createErrorResponse } from '../utils';

interface rootAccessMiddlewareProps {
  serviceName: string;
  port: number;
  docs?: string;
}

export function errorHandler(
  error: ServiceError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logError(error, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json(createErrorResponse(message));

  next();
}

export const rootAccessCheck = ({
  serviceName,
  port,
  docs,
}: rootAccessMiddlewareProps) => {
  return (_: Request, res: Response) => {
    return res.json({
      success: true,
      message: `Welcome to ${serviceName} Service!`,
      serviceName,
      port,
      docs,
      timestamp: new Date().toISOString(),
    });
  };
};
