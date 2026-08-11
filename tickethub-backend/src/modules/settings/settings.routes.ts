import { Router } from 'express';
import { getPublicSettings } from './settings.controller.js';

const router = Router();

router.get('/', getPublicSettings);

export default router;