import type { RequestHandler } from 'express';
interface CookieParserProps {
    secret?: string;
}
declare function cookieParserMiddleware({ secret, }?: CookieParserProps): RequestHandler;
export default cookieParserMiddleware;
//# sourceMappingURL=cookie-parser.d.ts.map