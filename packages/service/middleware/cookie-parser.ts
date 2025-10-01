import cookieParser from 'cookie-parser';
import type { RequestHandler } from 'express';

interface CookieParserProps {
  secret?: string;
}

function cookieParserMiddleware({
  secret,
}: CookieParserProps = {}): RequestHandler {
  if (secret) {
    return cookieParser(secret); // Use secret for signed cookies if provided
  }
  return cookieParser();
}

export default cookieParserMiddleware;
