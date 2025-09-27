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
};
