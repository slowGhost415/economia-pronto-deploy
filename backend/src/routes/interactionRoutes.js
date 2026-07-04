import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { logInteraction, getHistory } from '../controllers/interactionController.js';

const router = express.Router();

router.post('/log', authMiddleware, logInteraction);
router.get('/history', authMiddleware, getHistory);

export default router;
