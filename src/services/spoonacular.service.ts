import axios from 'axios';

import { serverConfig } from '../configs/server.config';

export const searchFoodReceipe = async (foodName: string) => {
    const response = await axios.get(serverConfig.spoonacularApiUrl, {
        params: {
            query: foodName,
            number: 1,
            addRecipeInformation: true,
            apiKey: serverConfig.spoonacularApiKey,
        },
        timeout: 5000,
    });

    return response.data as unknown;
};
