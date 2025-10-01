import { CookieOptions } from 'express';
import { serverConfig } from './server.config';

export const refreshTokenCookieConfig: CookieOptions = {
    httpOnly: true,
    domain: serverConfig.cookieDomain,
    path: '/',
    sameSite: 'strict',
    secure: serverConfig.cookieSecure,
    maxAge: serverConfig.refreshTokenTTLMs,
};
