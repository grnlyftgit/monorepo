import { Request, Response } from 'express';
import { formatTime } from '../utils/actions';

interface rootAccessMiddlewareProps {
  serviceName: string;
  port: number;
}

interface healthCheckMiddlewareProps {
  port: number;
  serviceName: string;
  version?: string;
}

export const rootAccessCheck = ({
  serviceName,
  port,
}: rootAccessMiddlewareProps) => {
  return (_: Request, res: Response) => {
    return res.json({
      success: true,
      message: `Welcome to ${serviceName} Service!`,
      serviceName,
      port,
      timestamp: new Date().toISOString(),
    });
  };
};

export const healthCheck = ({
  port,
  serviceName,
  version,
}: healthCheckMiddlewareProps) => {
  return (_: Request, res: Response) => {
    const uptime = formatTime(process.uptime());

    return res.json({
      success: true,
      status: 'healthy',
      serviceName,
      version,
      port,
      uptime,
      timestamp: new Date().toISOString(),
    });
  };
};
