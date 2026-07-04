import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getSystemDashboard, performAction } from '../controllers/systemController.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, getSystemDashboard);
router.post('/action', authMiddleware, performAction);

export default router;
