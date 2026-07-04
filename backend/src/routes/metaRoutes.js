import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { listarMetas, criarMeta, atualizarMeta, deletarMeta } from '../controllers/metaController.js';

const router = express.Router();

router.get('/', authMiddleware, listarMetas);
router.post('/', authMiddleware, criarMeta);
router.patch('/:id', authMiddleware, atualizarMeta);
router.delete('/:id', authMiddleware, deletarMeta);

export default router;
