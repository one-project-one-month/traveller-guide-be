import { NextFunction, Request, Response } from 'express';

export const requestTimeout = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            console.warn(`Request timeout for ${req.method} ${req.path}`);

            res.status(408).json({ error: 'Request timeout' });
        }
    }, 30000);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
};
