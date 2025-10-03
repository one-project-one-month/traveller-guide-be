import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import HTTP_STATUS from 'http-status';
import { get } from 'lodash';
import type { StringValue } from 'ms';

import { serverConfig } from '../configs/server.config';
import { AUTH_MESSAGES } from '../constants/messages/auth.messages';
import { AppError } from '../helpers/app-error';
import { jwtSign, jwtVerify } from '../helpers/jwt';
import { userRepository } from '../repositories/user.repository';
import logger from '../utils/logger';
import type { RegisterInput } from '../validators/auth.scehma';

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

    const { decoded } = jwtVerify(refreshToken) as {
        decoded: { id?: string } | null;
    };

    if (!decoded) {
        return false;
    }

    const rawId = decoded['id'] as unknown;
    const userId = typeof rawId === 'number' ? rawId : Number(rawId);

    if (!userId) {
        return false;
    }

    try {
        const user = await userRepository.findUserById(Number(userId));

        if (!user) {
            return false;
        }

        // Remove password from payload
        /* eslint-disable @typescript-eslint/no-unused-vars */
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
export const createUserWithTokens = async (userData: RegisterInput) => {
    // Only allow expected fields to be passed to user creation
    const name = String((userData as Record<string, unknown>)['name']);
    const email = String((userData as Record<string, unknown>)['email']);
    const password = String((userData as Record<string, unknown>)['password']);

    // Hash password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await userRepository.createUser({
        name,
        email,
        password: hashedPassword,
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
        const user = await userRepository.findUserByEmail(email);

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

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env['GOOGLE_CLIENT_ID']);

/**
 * Logs in or registers a user via Google ID token and returns JWTs.
 */
export const loginWithGoogle = async (idToken: string) => {
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env['GOOGLE_CLIENT_ID'],
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
        throw new AppError('Google authentication failed', 400);
    }

    let user = await userRepository.findUserByGoogleId(payload.sub);

    if (!user) {
        user = await userRepository.findUserByEmail(payload.email);
        if (user) {
            // Link Google ID to existing account
            user = await userRepository.updateUser(user.id, {
                googleId: payload.sub,
            });
        } else {
            // Create new user
            user = await userRepository.createUser({
                name: payload.name || (payload.email.split('@')[0] as string),
                email: payload.email,
                googleId: payload.sub,
                password: '',
            });
        }
    }

    // Remove password before creating tokens
    const { password, ...userPayload } = user;
    const { accessToken, refreshToken } = signJWTs(userPayload);

    return { accessToken, refreshToken, user: userPayload };
};
