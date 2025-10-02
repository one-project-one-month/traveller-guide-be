import { object, string, type TypeOf } from 'zod';

import { VALIDATION_MESSAGES } from '../constants/messages/validation.messages';

export const registerSchema = object({
    body: object({
        name: string({
            required_error: VALIDATION_MESSAGES.NAME_REQUIRED,
        }),
        email: string({
            required_error: VALIDATION_MESSAGES.EMAIL_REQUIRED,
        }).email(VALIDATION_MESSAGES.INVALID_EMAIL),
        password: string({
            required_error: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
        }).min(6, VALIDATION_MESSAGES.PASSWORD_MIN),
        passwordConfirmation: string({
            required_error: VALIDATION_MESSAGES.PASSWORD_CONFIRM_REQUIRED,
        }).min(6, VALIDATION_MESSAGES.PASSWORD_CONFIRM_MIN),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: VALIDATION_MESSAGES.PASSWORDS_MISMATCH,
        path: ['passwordConfirmation'],
    }),
});

export const loginSchema = object({
    body: object({
        email: string({
            required_error: VALIDATION_MESSAGES.EMAIL_REQUIRED,
        }).email(VALIDATION_MESSAGES.INVALID_EMAIL),
        password: string({
            required_error: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
        }),
    }),
});

export type RegisterInput = TypeOf<typeof registerSchema>['body'];
export type LoginInput = TypeOf<typeof loginSchema>['body'];
