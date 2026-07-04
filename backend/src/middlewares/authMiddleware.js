import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token nao fornecido' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET nao configurado');
    return res.status(500).json({ error: 'Configuracao de autenticacao ausente' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, nome: decoded.nome, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido' });
  }
};

export default authMiddleware;
