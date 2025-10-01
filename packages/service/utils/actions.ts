import { createErrorResponse } from './index';
import { createLogger } from '../lib/logger';

const logger = createLogger('ServiceActions');

export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

export const handleServerShutdown = async () => {
  try {
    logger.info('SERVER SHUTDOWN');
    process.exit(0);
  } catch (error) {
    createErrorResponse('Error during server shutdown');
  }
};
