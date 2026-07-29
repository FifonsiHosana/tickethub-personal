import { Router } from 'express';
import { z } from 'zod';
import validateSafe from 'express-zod-safe';

import { getSettings, updateSettings } from './settings.controller.js';

const router = Router();

router.get('/', getSettings);
router.patch(
  '/',
  validateSafe({ body: z.record(z.string(), z.string()) }),
  updateSettings,
);

export default router;
