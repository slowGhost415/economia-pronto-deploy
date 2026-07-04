import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { listarTransacoes, criarTransacao, deletarTransacao, resumoFinanceiro } from '../controllers/transacaoController.js';

const router = express.Router();

router.get('/', authMiddleware, listarTransacoes);
router.post('/', authMiddleware, criarTransacao);
router.delete('/:id', authMiddleware, deletarTransacao);
router.get('/resumo', authMiddleware, resumoFinanceiro);

export default router;
