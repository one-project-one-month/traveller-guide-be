export const SYSTEM_MESSAGES = {
    // General system messages
    SERVER_ERROR: 'Internal server error occured',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    REQUEST_TIMEOUT: 'Request timeout',
    TOO_MANY_REQUESTS: 'Too many requests from this IP, please try again later',
    ROUTE_NOT_FOUND: 'The requested route was not found',
    METHOD_NOT_ALLOWED: 'HTTP method not allowed for this route',
    INVALID_JSON: 'Invalid JSON format in request body',
    PAYLOAD_TOO_LARGE: 'Request payload is too large',
    READINESS_FAILED: 'Readiness check failed',
    GENERIC_ERROR_MESSAGE: 'Something went wrong',
    NON_OPERATIONAL_ERROR: 'Non-operational error occured',
    REQUEST_VALIDATION_ERROR: 'Validation error occured',
} as const; // the object values are widened to string without const (for SystemMessage type)

export type SystemMessage =
    (typeof SYSTEM_MESSAGES)[keyof typeof SYSTEM_MESSAGES];
