export const ROUTES = {
    // health and system
    HEALTH: 'health',
    READY: '/ready',
    API_DOCS: '/api-docs',

    // base API paths
    API: {
        BASE: '/api',
        V1: '/api/v1',
    },

    // authentication
    AUTH: {
        BASE: '/auth',
        LOGIN: '/login',
        REGISTER: '/register',
        REFRESH: '/refresh',
        GOOGLE_AUTH: '/google',
    },
} as const;

export type ApiRoute = (typeof ROUTES.API)[keyof typeof ROUTES.API];
export type AuthRoute = (typeof ROUTES.AUTH)[keyof typeof ROUTES.AUTH];
