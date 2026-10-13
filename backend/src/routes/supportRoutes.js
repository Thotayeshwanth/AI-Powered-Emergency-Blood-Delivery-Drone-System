import express from 'express';
import { handleChat, handleCallbackRequest } from '../controllers/supportController.js';

const router = express.Router();

router.post('/chat', handleChat);
router.post('/callback', handleCallbackRequest);

export default router;
