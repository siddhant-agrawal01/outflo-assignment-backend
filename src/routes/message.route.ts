

import express from 'express';
import { generateMessage } from '../controllers/message.controller';

const router = express.Router();

router.post('/personalized-message', generateMessage);

export default router;
