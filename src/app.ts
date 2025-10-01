import { createServer } from 'http';

import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import express, { type Request, type Response, type Express } from 'express';
import helmet from 'helmet';
import HTTP_STATUS from 'http-status';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

config();

import { serverConfig } from './configs/server.config';
import { STATUS_MESSAGES } from './constants/messages/status.messages';
import { SYSTEM_MESSAGES } from './constants/messages/system.messages';
import { ROUTES } from './constants/routes.constant';
import { specs } from './lib/swagger';
import { corsMiddleware } from './middlewares/cors.middleware';
import { errorHandler } from './middlewares/error.middleware';
import {
    authLimiter,
    generalLimiter,
} from './middlewares/rate-limit.middleware';
import { requestTimeout } from './middlewares/request-timeout.middleware';
import authRouter from './routes/auth.routes';
import logger from './utils/logger';

// App
export const createApp = () => {
    const app = express();
    const server = createServer(app);

    // Middlewares
    setupSecurityMiddlewares(app);
    setupLoggingMiddlewares(app);
    setupParsingMiddlewares(app);
    setupCustomMiddlewares(app);

    // Routes
    setupRoutes(app);
    setupHealthChecks(app);

    setup404Handler(app);

    // Error handler
    app.use(errorHandler);

    return { app, server };
};

// Set up middlewares
const setupSecurityMiddlewares = (app: Express) => {
    // Security headers
    app.use(helmet());

    // Rate limiting
    app.use(ROUTES.API.V1 + ROUTES.AUTH.BASE, authLimiter);
    app.use(ROUTES.API.V1, generalLimiter);

    // Cors policies
    app.options('*', corsMiddleware);
    app.use(corsMiddleware);
};

const setupLoggingMiddlewares = (app: Express) => {
    app.use(
        morgan(serverConfig.morganFormat, {
            stream: {
                write: (message: string) => logger.info(message.trim()),
            },
        })
    );
};

const setupParsingMiddlewares = (app: Express) => {
    // Compression
    app.use(compression());

    // Request timeout
    app.use(requestTimeout);

    // Body parsing
    app.use(bodyParser.json({ limit: serverConfig.bodyLimit }));
    app.use(
        bodyParser.urlencoded({ extended: true, limit: serverConfig.bodyLimit })
    );

    // Cookie parsing
    app.use(cookieParser());
};

const setupCustomMiddlewares = (app: Express) => {
    console.log(typeof app);
};

// Setup routes
const setupRoutes = (app: Express) => {
    // TODO: create a version specific router (like v1Router)

    app.use(ROUTES.API_DOCS, swaggerUi.serve, swaggerUi.setup(specs));

    app.use(ROUTES.API.V1 + ROUTES.AUTH.BASE, authRouter); // Auth router
};

const setup404Handler = (app: Express) => {
    app.use('*', (req: Request, res: Response) => {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: STATUS_MESSAGES.ERROR,
            message: SYSTEM_MESSAGES.ROUTE_NOT_FOUND,
            data: {
                path: req.originalUrl,
                method: req.method,
            },
        });
    });
};

const setupHealthChecks = (app: Express) => {
    // Health check
    app.get(ROUTES.HEALTH, (_, res) => {
        res.status(HTTP_STATUS.OK).send(HTTP_STATUS[200]);
    });

    // Readiness check
    app.get(ROUTES.READY, (_, res) => {
        try {
            // TODO: Database connectivity check here
            // Add more services check...

            res.status(HTTP_STATUS.OK).json({
                status: STATUS_MESSAGES.SUCCESS,
                data: {
                    ready: true,
                    timestamp: new Date().toISOString(),
                    services: {
                        database: STATUS_MESSAGES.CONNECTED,
                        // Add other services status...
                    },
                },
            });
        } catch (error) {
            console.warn(`${SYSTEM_MESSAGES.READINESS_FAILED}:`, error);

            res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
                status: STATUS_MESSAGES.ERROR,
                message: HTTP_STATUS[503],
            });
        }
    });
};
