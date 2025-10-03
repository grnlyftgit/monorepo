import type { Request, Response, NextFunction } from 'express';
import arcjet, {
  shield,
  detectBot,
  tokenBucket,
  validateEmail,
} from '@arcjet/node';
import authEnvConfig from './env';
import { isSpoofedBot } from '@arcjet/inspect';
import { createLogger } from '@repo/service/lib/logger';

const logger = createLogger('Arcjet');

const mode = authEnvConfig.ARCJET_ENV === 'production' ? 'LIVE' : 'DRY_RUN';

const aj = arcjet({
  key: authEnvConfig.ARCJET_KEY,
  rules: [
    shield({ mode }),
    detectBot({
      mode,
      allow: ['CATEGORY:SEARCH_ENGINE'],
    }),
    tokenBucket({
      mode,
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

const ajEmailValidator = arcjet({
  key: authEnvConfig.ARCJET_KEY,
  rules: [
    validateEmail({
      mode,
      block: ['DISPOSABLE', 'NO_MX_RECORDS', 'INVALID'],
    }),
  ],
});

export const arcjetMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decision = await aj.protect(req, { requested: 5 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        logger.warn('Rate limit exceeded');
        res.status(429).json({ error: 'Too Many Requests' });
        return;
      } else if (decision.reason.isBot()) {
        logger.warn('Bot detected and blocked');
        res.status(403).json({ error: 'No bots allowed' });
        return;
      } else {
        logger.warn('Request denied by Arcjet');
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    } else if (decision.ip.isHosting()) {
      logger.warn('Hosting provider IP blocked');
      res.status(403).json({ error: 'Forbidden' });
      return;
    } else if (decision.results.some(isSpoofedBot)) {
      logger.warn('Spoofed bot detected and blocked');
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Arcjet protection error', {
      error: (error as Error).message,
    });
    next();
  }
};

export async function arcjetEmailValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const email = req.body.email;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    const decision = await ajEmailValidator.protect(req, { email });
    if (decision.isDenied()) {
      logger.warn(
        'Email validation failed: Signup not allowed with this email'
      );
      res.status(403).json({
        error: 'Email validation failed: Signup not allowed with this email',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}

export default aj;
