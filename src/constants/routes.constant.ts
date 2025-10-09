export const ROUTES = {
    // Health and system
    HEALTH: 'health',
    READY: '/ready',
    API_DOCS: '/api-docs',

    // Base API paths
    API: {
        BASE: '/api',
        V1: '/api/v1',
    },

    // Authentication
    AUTH: {
        BASE: '/auth',
        LOGIN: '/login',
        REGISTER: '/register',
        REFRESH: '/refresh',
        GOOGLE_AUTH: '/google',
    },

    // External api
    EXTERNAL_API: {
        BASE: '/external-apis',
        WIKIPEDIA: '/wikipedia',
    },
} as const;

export type ApiRoute = (typeof ROUTES.API)[keyof typeof ROUTES.API];
export type AuthRoute = (typeof ROUTES.AUTH)[keyof typeof ROUTES.AUTH];
