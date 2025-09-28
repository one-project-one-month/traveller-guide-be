export const serverConfig = {
    // general
    port: parseInt(process.env['PORT'] || '3000'),
    nodeEnv: process.env['NODE_ENV'] || 'development',
    bodyLimit: process.env['BODY_LIMIT'] || '1mb',
    requestTimeout: parseInt(process.env['REQUEST_TIMEOUT'] || '30000'),
    morganFormat:
        process.env['MORGAN_FORMAT'] ||
        ':date[clf] :method :url :status :response-time ms - :user-agent',

    // rate limit
    generalRateLimitWindow:
        parseInt(process.env['GENERAL_RATE_LIMIT_WINDOW']!) || 15 * 60 * 1000, // 15 min
    generalRateLimitMax:
        parseInt(process.env['GENERAL_RATE_LIMIT_MAX']!) || 100,
    authRateLimitWindow:
        parseInt(process.env['AUTH_RATE_LIMIT_MAX']!) || 15 * 60 * 100,
    authRateLimitMax: parseInt(process.env['AUTH_RATE_LIMIT_MAX']!) || 5,

    // cors
    corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',

    // cloudinary
    cloudinaryCloudName: process.env['CLOUDINARY_CLOUD_NAME'],
    cloudinaryApiKey: process.env['CLOUDINARY_API_KEY'],
    cloudinaryApiSecret: process.env['CLOUDINARY_API_SECRET'],

    // JWT
    jwtSecret: process.env['JWT_SECRET']!,
    accessTokenTTL: process.env['JWT_ACCESS_TOKEN_TTL'] || '15m',
    refreshTOkenTTL: process.env['JWT_REFRESH_TOKEN_TTL'] || '7d',
    refreshTokenTTLMs:
        Number(process.env['REFRESH_TOKEN_TTL_MS']) || 1000 * 60 * 60 * 24 * 7, // 7 days
    tokenIssuer: process.env['TOKEN_ISSUER'] || 'turning-point',

    // Cookie
    cookieDomain: process.env['COOKIE_DOMAIN'] || 'localhost',
    cookieSecure: Boolean(process.env['COOKIE_SECURE'] || true),
};
