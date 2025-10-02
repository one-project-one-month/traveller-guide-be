import jwt from 'jsonwebtoken';

import { serverConfig } from '../configs/server.config';
import { AUTH_MESSAGES } from '../constants/messages/auth.messages';

export type DecodedToken = jwt.JwtPayload;

export const jwtSign = (payload: object, options: jwt.SignOptions) =>
    jwt.sign(payload, serverConfig.jwtSecret, {
        ...options,
        issuer: serverConfig.tokenIssuer,
    });

export const jwtVerify = (
    token: string
): { valid: boolean; expired: boolean; decoded: DecodedToken | null } => {
    try {
        const decoded = jwt.verify(
            token,
            serverConfig.jwtSecret
        ) as jwt.JwtPayload;

        return {
            valid: true,
            expired: false,
            decoded,
        };
    } catch (error: unknown) {
        return {
            valid: false,
            expired: (error as Error).message === AUTH_MESSAGES.JWT_EXPEIRED,
            decoded: null,
        };
    }
};
