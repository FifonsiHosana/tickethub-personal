import { Router } from 'express';

import { uploadMedia } from './media.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';

import { upload } from '@/middleware/upload.js';

const router = Router();

router.use(authenticate);

/**
 * Upload media files
 *
 * POST
 *
 * /media/upload
 *
 *
 * multipart/form-data
 *
 * files[]
 */
router.post(
  '/upload',

  upload.array('files', 10),

  uploadMedia,
);

export default router;
