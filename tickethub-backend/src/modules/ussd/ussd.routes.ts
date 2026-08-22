import express from 'express';
import { testQuery, ussdController } from './ussd.controllers.js';

const router = express.Router();

router.post('/', ussdController);
router.get('/test', testQuery);

export default router;
