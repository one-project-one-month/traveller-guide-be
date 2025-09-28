import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export const prisma = new PrismaClient({
    log:
        process.env['NODE_ENV'] === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'],
});

// Graceful shutdown
// TODO: align with existing server's graceful shutdown logic
process.on('SIGINT', async () => {
    logger.info('Disconnectin prisma...');

    await prisma.$disconnect();
});
