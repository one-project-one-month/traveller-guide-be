import HTTP_STATUS from 'http-status';
import { NextFunction, Response, Request } from 'express';
import { catchAsync } from '../helpers/catch-async';
import { reIssueTokens } from '../services/auth.service';
import * as authService from '../services/auth.service';
import logger from '../utils/logger';
import { serverConfig } from '../configs/server.config';
import { AppError } from '../helpers/app-error';
import { AUTH_MESSAGES } from '../constants/messages/auth.messages';
import { STATUS_MESSAGES } from '../constants/messages/status.messages';

/**
 * Registers a new user and returns tokens and user payload.
 * Logs registration event for auditing.
 */
export const registerHandler = catchAsync(
    async (req: Request, res: Response) => {
        const {
            accessToken,
            refreshToken,
            user: payload,
        } = await authService.createUserWithTokens(req.body);

        res.status(HTTP_STATUS.CREATED).json({
            status: STATUS_MESSAGES.SUCCESS,
            message: AUTH_MESSAGES.REGISTRATION_SUCCESS,
            data: {
                accessToken,
                refreshToken,
                user: payload,
            },
        });

        logger.info(
            { userId: payload.id, email: payload.email },
            'User registered'
        );
    }
);

/**
 * Logs in a user, sets refresh token cookie, and returns tokens and user payload.
 * Logs login event for auditing.
 */
export const loginHandler = catchAsync(async (req: Request, res: Response) => {
    const {
        accessToken,
        refreshToken,
        user: payload,
    } = await authService.validateUserCredentials(
        req.body.email,
        req.body.password
    );

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        domain: serverConfig.cookieDomain,
        path: '/',
        sameSite: 'strict',
        secure: serverConfig.cookieSecure,
        maxAge: serverConfig.refreshTokenTTLMs,
    });

    res.status(HTTP_STATUS.OK).json({
        status: STATUS_MESSAGES.SUCCESS,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        data: {
            accessToken,
            refreshToken,
            user: payload,
        },
    });

    logger.info({ userId: payload.id, email: payload.email }, 'User logged in');
});

/**
 * Issues a new access token (and refresh token if needed) from a valid refresh token.
 * Returns 401 if refresh token is missing or invalid.
 */
export const refreshTokensHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken)
        return new AppError(
            AUTH_MESSAGES.REFRESH_TOKEN_MISSING,
            HTTP_STATUS.BAD_REQUEST
        );

    const newTokens = await reIssueTokens(refreshToken as string);

    if (!newTokens || !newTokens.accessToken)
        return next(
            new AppError(
                AUTH_MESSAGES.REFRESH_TOKEN_INVALID,
                HTTP_STATUS.UNAUTHORIZED
            )
        );

    res.setHeader('Cache-Control', 'no-store');

    if (newTokens.refreshToken) {
        res.cookie('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            domain: serverConfig.cookieDomain,
            path: '/',
            sameSite: 'strict',
            secure: serverConfig.cookieSecure,
            maxAge: serverConfig.refreshTokenTTLMs,
        });
    }

    return res.status(HTTP_STATUS.OK).json({
        status: STATUS_MESSAGES.SUCCESS,
        message: AUTH_MESSAGES.TOKEN_REFRESHED,
        data: { ...newTokens },
    });
};
