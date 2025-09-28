import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status';
import logger from '../utils/logger';
import { AppError } from '../helpers/app-error';
import { serverConfig } from '../configs/server.config';
import { ZodError } from 'zod';
import { PrismaError } from '../constants/prisma-error.constant';
import { SYSTEM_MESSAGES } from '../constants/messages/system.messages';
import { AUTH_MESSAGES } from '../constants/messages/auth.messages';
import { STATUS_MESSAGES } from '../constants/messages/status.messages';
import { ERROR_MESSAGES } from '../constants/messages/error.messages';

// TODO: create error name constants

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
    | ZodError
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

const isZodError = (err: KnownError): err is ZodError => {
    return err instanceof ZodError;
};

// Helper function to ensure we always have an AppError instance
const ensureAppError = (err: KnownError): AppError => {
    if (isAppError(err)) {
        return err;
    }

    // Check if error has httpCode or statusCode properties
    if (isErrorWithCode(err)) {
        return new AppError(
            err.message || SYSTEM_MESSAGES.GENERIC_ERROR_MESSAGE,
            err.httpCode || err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
            err.isOperational || false
        );
    }

    // For regular Error objects or other types
    return new AppError(
        err.message || SYSTEM_MESSAGES.GENERIC_ERROR_MESSAGE,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        false
    );
};

const handleJWTError = (): AppError => {
    return new AppError(AUTH_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
};

const handlePrismaClientKnownRequestError = (err: PrismaError): AppError => {
    if (err.code === PrismaError.UniqueConstraintViolation && err.meta) {
        return new AppError(
            ERROR_MESSAGES.DUPLICATEV_VALUE +
                (Array.isArray(err.meta['target'])
                    ? err.meta['target'].join(', ')
                    : String(err.meta['target'])),
            HTTP_STATUS.BAD_REQUEST
        );
    }

    return new AppError(err.message, HTTP_STATUS.BAD_REQUEST);
};

const handleZodError = (err: ZodError): AppError => {
    // Extract validation errors from Zod error issues
    const validationErrors = err.issues.map((issue) => {
        // Skip 'body' in path if it exists (common in request validation)
        const relevantPath = issue.path.filter((segment) => segment !== 'body');
        const fieldName =
            relevantPath.length > 0 ? relevantPath.join('.') : 'field';
        return `${fieldName}: ${issue.message}`;
    });

    return new AppError(
        `${ERROR_MESSAGES.VALIDATION_FAILED}${validationErrors.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST,
        true
    );
};

// Helper function to process errors into AppError format
const processError = (err: KnownError): AppError => {
    if (isPrismaError(err)) {
        return handlePrismaClientKnownRequestError(err);
    } else if (isJWTError(err)) {
        return handleJWTError();
    } else if (isZodError(err)) {
        return handleZodError(err);
    } else {
        // Convert any other error to AppError
        return ensureAppError(err);
    }
};

// Send error to the development environment
const sendDev = (err: AppError, res: Response) => {
    res.status(err.httpCode).json({
        status: err.status,
        message: err.message,
        data: {
            httpCode: err.httpCode,
            name: err.name,
            error: {
                stack: err.stack,
                ...err,
            },
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
            SYSTEM_MESSAGES.NON_OPERATIONAL_ERROR
        );
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: STATUS_MESSAGES.ERROR,
            message: SYSTEM_MESSAGES.GENERIC_ERROR_MESSAGE,
        });
    }
};

// Main error handler
export const errorHandler = (
    err: KnownError,
    _req: Request,
    res: Response,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    _next: NextFunction
) => {
    logger.error(
        { name: err.name, message: err.message },
        'Error handler triggered:'
    );

    // Process the error once, regardless of environment
    const processedError = processError(err);

    // Only the response format differs between environments
    if (
        serverConfig.nodeEnv === 'development' ||
        serverConfig.nodeEnv === 'test'
    ) {
        sendDev(processedError, res);
    } else {
        sendProd(processedError, res);
    }
};
