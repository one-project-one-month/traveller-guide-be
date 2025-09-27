import { serverConfig } from './server.config';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: serverConfig.cloudinaryCloudName,
    api_key: serverConfig.cloudinaryApiKey,
    api_secret: serverConfig.cloudinaryApiSecret,
});

export default cloudinary;
