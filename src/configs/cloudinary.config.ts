import { v2 as cloudinary } from 'cloudinary';

import { serverConfig } from './server.config';

cloudinary.config({
    cloud_name: serverConfig.cloudinaryCloudName,
    api_key: serverConfig.cloudinaryApiKey,
    api_secret: serverConfig.cloudinaryApiSecret,
});

export default cloudinary;
