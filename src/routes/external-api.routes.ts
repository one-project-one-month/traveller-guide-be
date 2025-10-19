import { Router } from 'express';

import { ROUTES } from '../constants/routes.constant';
import {
    searchSpoonacularHandler,
    searchWikipediaHandler,
} from '../controllers/external-api.controller';

const externalApiRouter = Router();

externalApiRouter.post(ROUTES.EXTERNAL_API.WIKIPEDIA, searchWikipediaHandler);
externalApiRouter.post(
    ROUTES.EXTERNAL_API.SPOONACULAR,
    searchSpoonacularHandler
);

export default externalApiRouter;
