import { rateLimit } from 'express-rate-limit';
import { serverConfig } from '../configs/server.config';
import { MESSAGES } from '../constants/messages.constant';

export const authLimiter = rateLimit({
    windowMs: serverConfig.authRateLimitWindow,
    max: serverConfig.authRateLimitMax,
    message: MESSAGES.AUTH.TOO_MANY_AUTH_ATTEMPTS,
});

export const generalLimiter = rateLimit({
    windowMs: serverConfig.generalRateLimitWindow,
    max: serverConfig.authRateLimitMax,
    message: MESSAGES.SYSTEM.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
});
