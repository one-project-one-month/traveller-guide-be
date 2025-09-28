export const STATUS_MESSAGES = {
    HEALTHY: 'healthy',
    READY: 'ready',
    SUCCESS: 'success',
    FAIL: 'fail',
    ERROR: 'error',
    CONNECTED: 'connected',
} as const;

export type StatusMessage =
    (typeof STATUS_MESSAGES)[keyof typeof STATUS_MESSAGES];
