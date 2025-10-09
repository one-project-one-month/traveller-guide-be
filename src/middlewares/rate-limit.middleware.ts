import { rateLimit } from 'express-rate-limit';

import { serverConfig } from '../configs/server.config';
import { AUTH_MESSAGES } from '../constants/messages/auth.messages';
import { SYSTEM_MESSAGES } from '../constants/messages/system.messages';

export const authLimiter = rateLimit({
    windowMs: serverConfig.authRateLimitWindow,
    max: serverConfig.authRateLimitMax,
    message: AUTH_MESSAGES.TOO_MANY_AUTH_ATTEMPTS,
});

export const generalLimiter = rateLimit({
    windowMs: serverConfig.generalRateLimitWindow,
    max: serverConfig.authRateLimitMax,
    message: SYSTEM_MESSAGES.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
});
