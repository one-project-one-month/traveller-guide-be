import { object, string, email, TypeOf } from 'zod';
import { VALIDATION_MESSAGES } from '../constants/messages/validation.messages';

export const registerSchema = object({
    body: object({
        name: string({
            error: VALIDATION_MESSAGES.NAME_REQUIRED,
        }),
        email: email({
            error: VALIDATION_MESSAGES.EMAIL_REQUIRED,
        }),
        password: string({
            error: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
        }).min(6, VALIDATION_MESSAGES.PASSWORD_MIN),
        passwordConfirmation: string({
            error: VALIDATION_MESSAGES.PASSWORD_CONFIRM_REQUIRED,
        }).min(6, VALIDATION_MESSAGES.PASSWORD_CONFIRM_MIN),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: VALIDATION_MESSAGES.PASSWORDS_MISMATCH,
        path: ['passwordConfirmation'],
    }),
});

export const loginSchema = object({
    body: object({
        email: email({
            error: VALIDATION_MESSAGES.EMAIL_REQUIRED,
        }),
        password: string({
            error: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
        }),
    }),
});

export type RegisterInput = TypeOf<typeof registerSchema>;
export type LoginInput = TypeOf<typeof loginSchema>;
