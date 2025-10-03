import { Router } from 'express';

import { ROUTES } from '../constants/routes.constant';
import {
    registerHandler,
    loginHandler,
    refreshTokensHandler,
    googleLoginHandler,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../validators/auth.scehma';

const authRouter = Router();

authRouter.post(
    ROUTES.AUTH.REGISTER,
    validate(registerSchema),
    registerHandler
);
authRouter.post(ROUTES.AUTH.LOGIN, validate(loginSchema), loginHandler);
authRouter.post(ROUTES.AUTH.GOOGLE_AUTH, googleLoginHandler);
authRouter.post(ROUTES.AUTH.REFRESH, refreshTokensHandler);

export default authRouter;
