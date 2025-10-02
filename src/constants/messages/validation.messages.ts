export const VALIDATION_MESSAGES = {
    // Auth
    NAME_REQUIRED: 'Username is required',
    EMAIL_REQUIRED: 'Email is required',
    INVALID_EMAIL: 'Email is not valid',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_MIN: 'Password must be at least 6 characters.',
    PASSWORD_CONFIRM_REQUIRED: 'Password Confirmation is required',
    PASSWORD_CONFIRM_MIN:
        'Password Confirmation must be at least 6 characters.',
    PASSWORDS_MISMATCH: 'Passwords do not match',
} as const;

export type ValidatinMessage =
    (typeof VALIDATION_MESSAGES)[keyof typeof VALIDATION_MESSAGES];
