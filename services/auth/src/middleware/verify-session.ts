import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';
import { user, session } from '@repo/db-neon/src/db/schema';

declare global {
  namespace Express {
    interface Request {
      user?: typeof user;
      session?: typeof session;
    }
  }
}

export async function verifySession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData?.user || !sessionData?.session) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized : Invalid or expired session',
      });
      return;
    }

    req.session = sessionData.session as typeof session;
    req.user = sessionData.user as typeof user;

    next();
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Session verification failed',
    });
  }
}
