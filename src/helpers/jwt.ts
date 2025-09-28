import jwt from 'jsonwebtoken';
import { serverConfig } from '../configs/server.config';
import { AUTH_MESSAGES } from '../constants/messages/auth.messages';

export const jwtSign = (paylaod: object, options: jwt.SignOptions) => {
    return jwt.sign(paylaod, serverConfig.jwtSecret, {
        ...options,
        issuer: serverConfig.tokenIssuer,
    });
};

export const jwtVerify = (token: string) => {
    try {
        const decoded = jwt.verify(token, serverConfig.jwtSecret);

        return {
            valid: true,
            expired: false,
            decoded,
        };
    } catch (error: any) {
        return {
            valid: false,
            expired: error.message === AUTH_MESSAGES.JWT_EXPEIRED,
            decoded: null,
        };
    }
};
