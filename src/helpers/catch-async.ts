import { serverConfig } from '../configs/server.config';
import { KnownError } from '../middlewares/error.middleware';
import logger from '../utils/logger';
import { NextFunction, Request, Response } from 'express';

const catchAsyncError = (
    asyncFn: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<unknown>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        asyncFn(req, res, next).catch((err: KnownError) => {
            if (serverConfig.nodeEnv === 'development') {
                logger.error(err, 'Catched asynchronous error:');
            }

            next(err);
        });
    };
};

export default catchAsyncError;
