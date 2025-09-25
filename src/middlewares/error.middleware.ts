import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status';

import logger from '../utils/logger';
import { AppError } from '../helpers/app-error';
import { serverConfig } from '../configs/server.config';
import { MESSAGES } from '../constants/messages.constant';

// Helper function to ensure we always have an AppError instance
const ensureAppError = (err: any): AppError => {
    if (err instanceof AppError) {
        return err;
    }

    // Convert regular Error or any other error to AppError
    return new AppError(
        err.message || MESSAGES.SYSTEM.GENERIC_ERROR_MESSAGE,
        err.httpCode || err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        err.isOperational || false
    );
};

const handleJWTError = (_err: any): AppError => {
    return new AppError(MESSAGES.AUTH.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
};

const handlePrismaClientKnownRequestError = (err: any): AppError => {
    return new AppError(err.message, HTTP_STATUS.BAD_REQUEST);
};

// Send error to the development environment
const sendDev = (err: AppError, res: Response) => {
    res.status(err.httpCode).json({
        status: err.status,
        message: err.message,
        data: {
            httpCode: err.httpCode,
            name: err.name,
            error: err,
            stack: err.stack,
        },
    });
};

// Send error to production environment
const sendProd = (err: AppError, res: Response) => {
    if (err.isOperational) {
        res.status(err.httpCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Better logging with structured data
        logger.error(
            {
                message: err.message,
                stack: err.stack,
                httpCode: err.httpCode,
                name: err.name,
            },
            MESSAGES.SYSTEM.NON_OPERATIONAL_ERROR
        );

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: MESSAGES.STATUS.ERROR,
            message: MESSAGES.SYSTEM.GENERIC_ERROR_MESSAGE,
        });
    }
};

// Main error handler
export const errorHandler = (err: any, _: Request, res: Response) => {
    if (
        serverConfig.nodeEnv === 'development' ||
        serverConfig.nodeEnv === 'test'
    ) {
        sendDev(ensureAppError(err), res);
    } else if (serverConfig.nodeEnv === 'production') {
        let processedError: AppError;

        // Handle specific error types and convert to AppError
        switch (err.name) {
            case 'PrismaClientKnownRequestError':
                processedError = handlePrismaClientKnownRequestError(err);
                break;

            case 'JsonWebTokenError':
            case 'TokenExpiredError':
            case 'NotBeforeError':
                processedError = handleJWTError(err);
                break;

            default:
                // Convert any other error to AppError
                processedError = ensureAppError(err);
                break;
        }

        sendProd(processedError, res);
    }
};
