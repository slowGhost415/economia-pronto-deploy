import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { listarInvestimentos, criarInvestimento, deletarInvestimento } from '../controllers/investimentoController.js';

const router = express.Router();

router.get('/', authMiddleware, listarInvestimentos);
router.post('/', authMiddleware, criarInvestimento);
router.delete('/:id', authMiddleware, deletarInvestimento);

export default router;
