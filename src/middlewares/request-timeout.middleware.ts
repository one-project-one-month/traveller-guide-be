import type { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status';

import { SYSTEM_MESSAGES } from '../constants/messages/system.messages';
import { AppError } from '../helpers/app-error';
import logger from '../utils/logger';

export const requestTimeout = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            logger.warn(`Request timeout for ${req.method} ${req.path}`);

            next(
                new AppError(
                    SYSTEM_MESSAGES.REQUEST_TIMEOUT,
                    HTTP_STATUS.REQUEST_TIMEOUT
                )
            );
        }
    }, 30000);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
};
