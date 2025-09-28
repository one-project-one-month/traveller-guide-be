export const AUTH_MESSAGES = {
    // Authenticaion messages

    // Success Messages
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTRATION_SUCCESS: 'Account created successfully',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
    EMAIL_VERIFIED: 'Email verified successfully',
    TOKEN_REFRESHED: 'Access token refreshed successfully',

    // Error Messages
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Access denied. Please login to continue',
    JWT_EXPEIRED: 'Token has expired',
    TOKEN_EXPIRED: 'Access token has expired',
    TOKEN_INVALID: 'Invalid or malformed token',
    TOKEN_MISSING: 'Access token is required',
    REFRESH_TOKEN_MISSING: 'Refresh token is missing',
    REFRESH_TOKEN_INVALID: 'Invalid refresh token',
    EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in',
    ACCOUNT_LOCKED:
        'Account has been temporarily locked due to multiple failed login attempts',
    TOO_MANY_AUTH_ATTEMPTS:
        'Too many authentication attempts, please try again later',
    PASSWORD_TOO_WEAK:
        'Password must be at least 8 characters with uppercase, lowercase, number and special character',
    EMAIL_ALREADY_EXISTS: 'An account with this email address already exists',
    EMAIL_NOT_FOUND: 'No account found with this email address',
    RESET_TOKEN_EXPIRED: 'Password reset token has expired',
    RESET_TOKEN_INVALID: 'Invalid password reset token',
    VERIFICATION_TOKEN_EXPIRED: 'Email verification token has expired',
    VERIFICATION_TOKEN_INVALID: 'Invalid email verification token',
    AUTHENTICATION_FAILED: 'Authentication failed',
} as const;

export type AuthMessage = (typeof AUTH_MESSAGES)[keyof typeof AUTH_MESSAGES];
