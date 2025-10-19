import type { Response, Request } from 'express';
import HTTP_STATUS from 'http-status';

import { EXTERNAL_API_MESSAGES } from '../constants/messages/external-api-messages';
import { STATUS_MESSAGES } from '../constants/messages/status.messages';
import { catchAsync } from '../helpers/catch-async';
import * as spoonacularService from '../services/spoonacular.service';
import { wikipediaService } from '../services/wikipedia.service';

/**
 * Handles Wikipedia search requests.
 * Fetches comprehensive page data for the given keyword using wikipediaService.
 * Responds with the search results and success message.
 */
export const searchWikipediaHandler = catchAsync(
    async (
        req: Request<unknown, unknown, { keyword: string }>,
        res: Response
    ) => {
        const result = await wikipediaService.getComprehensivePageData(
            req.body.keyword
        );

        res.status(HTTP_STATUS.OK).json({
            status: STATUS_MESSAGES.SUCCESS,
            message: EXTERNAL_API_MESSAGES.WIKIPEDIA_SEARCH_SUCCESS,
            data: {
                ...result,
            },
        });
    }
);

/**
 * Handles search requests to the Spoonacular API.
 * Fetches recipe data based on query parameters and returns formatted results.
 */
export const searchSpoonacularHandler = catchAsync(
    async (
        req: Request<unknown, unknown, { foodName: string }>,
        res: Response
    ) => {
        const result = await spoonacularService.searchFoodReceipe(
            req.body.foodName
        );

        res.status(HTTP_STATUS.OK).json({
            status: STATUS_MESSAGES.SUCCESS,
            message: EXTERNAL_API_MESSAGES.SPOONACULAR_SEARCH_SUCCESS,
            data: result,
        });
    }
);
