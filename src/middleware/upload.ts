import multer from 'multer';
import { Request } from 'express';
import { config } from '../config/env';

/**
 * Multer configuration untuk file upload
 * Menggunakan memory storage agar flexible untuk local atau asset service
 */

// Storage configuration - use memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check allowed mime types
  if (config.asset.allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.asset.serviceEnabled
      ? config.asset.maxFileSize
      : config.asset.maxLocalFileSize,
  },
});

// Single file upload
export const uploadSingle = upload.single('file');

// Multiple files upload
export const uploadMultiple = upload.array('files', 10); // Max 10 files
