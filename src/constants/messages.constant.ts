export const MESSAGES = {
    // Status messages
    STATUS: {
        HEALTHY: 'healthy',
        READY: 'ready',
        SUCCESS: 'success',
        FAIL: 'fail',
        ERROR: 'error',
        CONNECTED: 'connected',
    },

    // General system messages
    SYSTEM: {
        SERVER_ERROR: 'Internal server error occured',
        SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
        REQUEST_TIMEOUT: 'Request timeout',
        TOO_MANY_REQUESTS:
            'Too many requests from this IP, please try again later',
        ROUTE_NOT_FOUND: 'The requested route was not found',
        METHOD_NOT_ALLOWED: 'HTTP method not allowed for this route',
        INVALID_JSON: 'Invalid JSON format in request body',
        PAYLOAD_TOO_LARGE: 'Request payload is too large',
        READINESS_FAILED: 'Readiness check failed',
        GENERIC_ERROR_MESSAGE: 'Something went wrong',
        NON_OPERATIONAL_ERROR: 'Non-operational error occured',
    },

    // Authenticaion messages
    AUTH: {
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
        TOKEN_EXPIRED: 'Access token has expired',
        TOKEN_INVALID: 'Invalid or malformed token',
        TOKEN_MISSING: 'Access token is required',
        REFRESH_TOKEN_INVALID: 'Invalid refresh token',
        EMAIL_NOT_VERIFIED:
            'Please verify your email address before logging in',
        ACCOUNT_LOCKED:
            'Account has been temporarily locked due to multiple failed login attempts',
        TOO_MANY_AUTH_ATTEMPTS:
            'Too many authentication attempts, please try again later',
        PASSWORD_TOO_WEAK:
            'Password must be at least 8 characters with uppercase, lowercase, number and special character',
        EMAIL_ALREADY_EXISTS:
            'An account with this email address already exists',
        EMAIL_NOT_FOUND: 'No account found with this email address',
        RESET_TOKEN_EXPIRED: 'Password reset token has expired',
        RESET_TOKEN_INVALID: 'Invalid password reset token',
        VERIFICATION_TOKEN_EXPIRED: 'Email verification token has expired',
        VERIFICATION_TOKEN_INVALID: 'Invalid email verification token',
    },
} as const;

// Type definitions
export type StatusMessage =
    (typeof MESSAGES.STATUS)[keyof typeof MESSAGES.STATUS];
export type SystemMessage =
    (typeof MESSAGES.SYSTEM)[keyof typeof MESSAGES.SYSTEM];
export type AuthMessage = (typeof MESSAGES.AUTH)[keyof typeof MESSAGES.AUTH];
