import { NextFunction, Response, Request } from 'express';
import * as z from 'zod';

// TODO: refactor, next(error) in catch clause might be wrong

/**
 * Middleware factory to validate request body/query/params with Zod schema.
 * Returns 400 if validation fails.
 */
export const validate =
    (schema: z.ZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error: unknown) {
            next(error);
        }
    };
