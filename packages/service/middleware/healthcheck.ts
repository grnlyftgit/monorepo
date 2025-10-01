import { Request, Response } from "express";
import { formatTime } from "../utils/actions";

interface healthCheckMiddlewareProps {
  port: number;
  serviceName: string;
  version?: string;
}

export const healthCheck = ({
  port,
  serviceName,
  version,
}: healthCheckMiddlewareProps) => {
  return (req: Request, res: Response) => {
    const uptime = formatTime(process.uptime());

    return res.json({
      success: true,
      status: "healthy",
      serviceName,
      version,
      port,
      uptime,
      timestamp: new Date().toISOString(),
    });
  };
};


