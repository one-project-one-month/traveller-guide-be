import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../helpers/app-error';
import HTTP_STATUS from 'http-status';

// TODO: refactor this middlware properly

// Configure multer for memory storage (files stored in memory as Buffer)
const storage = multer.memoryStorage();

const fileFilter = (
    _: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                'Only image files are allowed!',
                HTTP_STATUS.BAD_REQUEST
            ) as unknown as null,
            false
        );
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

module.exports = upload;
