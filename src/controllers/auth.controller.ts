import { NextFunction, Request, Response } from 'express';

export const loginHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(req, res, next);
    // check user
    // reject if not exits
    // generate jwts
    // respond tokens
};

export const relgisterHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(req, res, next);
    // check if user exits
    // reject if exits
    // create user
    // generate jwts
    // respond tokens
};
