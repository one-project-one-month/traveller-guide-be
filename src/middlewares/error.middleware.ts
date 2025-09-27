import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status';
import logger from '../utils/logger';
import { AppError } from '../helpers/app-error';
import { serverConfig } from '../configs/server.config';
import { MESSAGES } from '../constants/messages.constant';

// Define interfaces for known error types
interface PrismaError extends Error {
    name: 'PrismaClientKnownRequestError';
    code?: string;
    meta?: Record<string, unknown>;
}

interface JWTError extends Error {
    name: 'JsonWebTokenError' | 'TokenExpiredError' | 'NotBeforeError';
}

interface ErrorWithCode extends Error {
    httpCode?: number;
    statusCode?: number;
    isOperational?: boolean;
}

export type KnownError =
    | AppError
    | PrismaError
    | JWTError
    | ErrorWithCode
    | Error;

// Type guards
const isAppError = (err: KnownError): err is AppError => {
    return err instanceof AppError;
};

const isErrorWithCode = (err: KnownError): err is ErrorWithCode => {
    return 'httpCode' in err || 'statusCode' in err;
};

const isPrismaError = (err: KnownError): err is PrismaError => {
    return err.name === 'PrismaClientKnownRequestError';
};

const isJWTError = (err: KnownError): err is JWTError => {
    return [
        'JsonWebTokenError',
        'TokenExpiredError',
        'NotBeforeError',
    ].includes(err.name);
};

// Helper function to ensure we always have an AppError instance
const ensureAppError = (err: KnownError): AppError => {
    if (isAppError(err)) {
        return err;
    }

    // Check if error has httpCode or statusCode properties
    if (isErrorWithCode(err)) {
        return new AppError(
            err.message || MESSAGES.SYSTEM.GENERIC_ERROR_MESSAGE,
            err.httpCode || err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
            err.isOperational || false
        );
    }

    // For regular Error objects or other types
    return new AppError(
        err.message || MESSAGES.SYSTEM.GENERIC_ERROR_MESSAGE,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        false
    );
};

const handleJWTError = (): AppError => {
    return new AppError(MESSAGES.AUTH.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
};

const handlePrismaClientKnownRequestError = (err: PrismaError): AppError => {
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
export const errorHandler = (err: KnownError, _: Request, res: Response) => {
    if (
        serverConfig.nodeEnv === 'development' ||
        serverConfig.nodeEnv === 'test'
    ) {
        sendDev(ensureAppError(err), res);
    } else if (serverConfig.nodeEnv === 'production') {
        let processedError: AppError;

        // Handle specific error types and convert to AppError
        if (isPrismaError(err)) {
            processedError = handlePrismaClientKnownRequestError(err);
        } else if (isJWTError(err)) {
            processedError = handleJWTError();
        } else {
            // Convert any other error to AppError
            processedError = ensureAppError(err);
        }

        sendProd(processedError, res);
    }
};
