import multer from 'multer';
import { Request } from 'express';

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
            new Error('Only image files are allowed!') as unknown as null,
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
