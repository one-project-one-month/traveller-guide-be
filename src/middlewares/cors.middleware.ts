import cors from 'cors';

import { serverConfig } from '../configs/server.config';

const corsOptions = {
    origin: serverConfig.corsOrigin,
    credentials: true,
    // exposedHeaders: ['x-access-token'],
};

export const corsMiddleware = cors(corsOptions);
