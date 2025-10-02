import Redis, { Redis as RedisInstance } from 'ioredis';
import 'dotenv/config';
import { createLogger } from '@repo/service/lib/logger';

const logger = createLogger('AWS Redis');

class RedisClient {
  private client: RedisInstance;

  constructor(host: string, port: number, password?: string) {
    this.client = new Redis({
      host,
      port,
      password,
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis server.');
    });

    this.client.on('error', (err: Error) => {
      logger.error('Error connecting to Redis:', err);
    });
  }

  // Getter method to access the Redis client instance
  public getClient(): RedisInstance {
    return this.client;
  }

  // Close the Redis connection
  public close(): void {
    this.client.quit();
    logger.info('Redis connection closed.');
  }
}

// Exporting a singleton instance of RedisClient
const redisHost = process.env.REDIS_HOST!;
const redisPort = process.env.REDIS_PORT
  ? Number(process.env.REDIS_PORT)
  : 6379;
const redisPassword = process.env.REDIS_PASSWORD!;

export const redisClient = new RedisClient(redisHost, redisPort, redisPassword);
