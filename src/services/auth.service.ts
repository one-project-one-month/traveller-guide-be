import { get } from 'lodash';
import logger from '../utils/logger';
import type { StringValue } from 'ms';
import bcrypt from 'bcryptjs';
import { jwtSign, jwtVerify } from '../helpers/jwt';
import { prisma } from '../lib/prisma';
import { AppError } from '../helpers/app-error';
import { serverConfig } from '../configs/server.config';
import { AUTH_MESSAGES } from '../constants/messages/auth.messages';
import HTTP_STATUS from 'http-status';

/**
 * Signs and returns access and refresh JWTs for a given payload.
 */
export const signJWTs = (payload: object) => {
    const accessToken = jwtSign(payload, {
        expiresIn: serverConfig.accessTokenTTL as StringValue | number,
    });

    const refreshToken = jwtSign(payload, {
        expiresIn: serverConfig.refreshTOkenTTL as StringValue | number,
    });

    return {
        accessToken,
        refreshToken,
    };
};

/**
 * Reissues new tokens if the refresh token is valid and user exists.
 * Used for token refresh endpoint.
 */
export const reIssueTokens = async (refreshToken: string) => {
    logger.info('Reissuing tokens...');

    const { decoded } = jwtVerify(refreshToken);

    if (!decoded) {
        return false;
    }

    const userId = get(decoded, 'id');

    if (!userId) {
        return false;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return false;
        }

        // Remove password from payload
        const { password, ...payload } = user;

        // Generate new tokens
        const newTokens = signJWTs(payload);

        return newTokens;
    } catch (error) {
        logger.error(error, 'Error reissuing tokens:');

        return false;
    }
};

/**
 * Creates a new user and returns tokens and user payload.
 * Used for registration endpoint.
 */
export const createUserWithTokens = async (userData: any) => {
    // Only allow expected fields to be passed to user creation
    const { name, email, password } = userData;

    // Hash password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    // Remove password from payload
    const { password: pw, ...payload } = user;
    const { accessToken, refreshToken } = signJWTs(payload);

    return { accessToken, refreshToken, user: payload };
};

/**
 * Validates user credentials and returns tokens and user payload.
 * Throws if user not found or password is invalid.
 */
export const validateUserCredentials = async (
    email: string,
    password: string
) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError(
                AUTH_MESSAGES.EMAIL_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            );
        }

        // Compare password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 400);
        }

        // Remove password from payload
        const { password: pw, ...payload } = user;
        const { accessToken, refreshToken } = signJWTs(payload);

        return { accessToken, refreshToken, user: payload };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        logger.error(error, 'Error validating user credentials:');
        throw new AppError(
            AUTH_MESSAGES.AUTHENTICATION_FAILED,
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
};
