import { Router } from 'express';
import {
    registerHandler,
    loginHandler,
    refreshTokensHandler,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../validators/auth.scehma';
import { ROUTES } from '../constants/routes.constant';

const authRouter = Router();

authRouter.post(
    ROUTES.AUTH.REGISTER,
    validate(registerSchema),
    registerHandler
);
authRouter.post(ROUTES.AUTH.LOGIN, validate(loginSchema), loginHandler);
authRouter.post(ROUTES.AUTH.REFRESH, refreshTokensHandler);

export default authRouter;
