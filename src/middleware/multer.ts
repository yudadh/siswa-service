import multer from 'multer';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // console.log(file.originalname)
    if (!file.originalname.match(/\.(xlsx)$/)) {
      logger.warn("Tipe file tidak didukung (hanya mendukung .xlsx)")
      return cb(new AppError('Only xlsx files are allowed', 400));
    }
    cb(null, true);
  },
});