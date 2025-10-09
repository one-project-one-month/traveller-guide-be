import type { NextFunction, Request, Response } from 'express';

import { serverConfig } from '../configs/server.config';
import type { KnownError } from '../middlewares/error.middleware';
import logger from '../utils/logger';

const catchAsyncError =
    (
        asyncFn: (
            req: Request,
            res: Response,
            next: NextFunction
        ) => Promise<unknown>
    ) =>
    (req: Request, res: Response, next: NextFunction) => {
        asyncFn(req, res, next).catch((err: KnownError) => {
            if (serverConfig.nodeEnv === 'development') {
                logger.error(err, 'Catched asynchronous error:');
            }

            next(err);
        });
    };

export { catchAsyncError as catchAsync };
