import type { NextFunction, Response, Request } from 'express';
import type * as z from 'zod';

// TODO: refactor, next(error) in catch clause might be wrong

/**
 * Middleware factory to validate request body/query/params with Zod schema.
 * Returns 400 if validation fails.
 */
export const validate =
    (schema: z.AnyZodObject) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body as unknown,
                query: req.query as unknown,
                params: req.params as unknown,
            });

            next();
        } catch (error: unknown) {
            next(error);
        }
    };
