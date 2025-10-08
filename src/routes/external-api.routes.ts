import { Router } from 'express';

import { ROUTES } from '../constants/routes.constant';
import { searchWikipediaHandler } from '../controllers/external-api.controller';

const externalApiRouter = Router();

externalApiRouter.post(ROUTES.EXTERNAL_API.WIKIPEDIA, searchWikipediaHandler);

export default externalApiRouter;
