import compression from 'compression';
import zlib from 'zlib';
import type { Request, Response, RequestHandler } from 'express';

function compressionFilter(req: Request, res: Response) {
  if (req.headers['x-no-compression']) {
    return false;
  }

  return compression.filter(req, res);
}

const compressionMiddleware: RequestHandler = compression({
  level: 9, // Max compression level for smallest payloads, CPU intensive but worth it for API speed over network
  memLevel: 9, // Optimize memory usage for better compression
  threshold: 512, // Compress responses larger than 512 bytes for better throughput
  filter: compressionFilter, // Custom filter to skip compression based on request
  chunkSize: 16 * 1024, // Larger chunks reduce processing stalls and improve streaming
  flush: zlib.constants.Z_SYNC_FLUSH, // Ensure timely delivery of compressed data
});

export default compressionMiddleware;
