import { serverConfig } from '../configs/server.config';
import logger from '../utils/logger';
import { NextFunction, Request, Response } from 'express';

const catchAsyncError = (asyncFn: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        asyncFn(req, res, next).catch((err: any) => {
            serverConfig.nodeEnv === 'development' &&
                logger.error(err, 'Catched asynchronous error:');

            next(err);
        });
    };
};

export default catchAsyncError;
