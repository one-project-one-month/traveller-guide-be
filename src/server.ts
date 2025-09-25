import { createApp } from './app';
import { serverConfig } from './configs/server.config';
import logger from './utils/logger';

const port = serverConfig.port;

const startServer = () => {
    // Connect to database first
    // TODO: Connect to db

    const { app, server } = createApp();

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
        logger.info(`${signal} received. Starting graceful shutdown...`);

        server.close((err) => {
            if (err) {
                logger.error(err, 'Error during server shutdown:');
                process.exit(1);
            }

            logger.info('Server closed successfully');
            process.exit(0);
        });

        // Force shutdown after 30 seconds
        setTimeout(() => {
            logger.error('Forceful shutdown after timeout');
            process.exit(1);
        }, 30000);
    };

    // Register signal handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Standard signal to terminate
    process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Triggered by Ctrl+C in the terminal

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error(
            {
                promise,
                reason,
            },
            'Unhandled Rejection at:'
        );

        gracefulShutdown('unhandledRejection');
    });

    process.on('uncaughtException', (error) => {
        logger.error(error, 'Uncaught Exception:');

        gracefulShutdown('uncaughtException');
    });

    app.listen(port, async () => {
        logger.info(`Server started at port ${port}...`);
    });

    return { app, server };
};

startServer();
