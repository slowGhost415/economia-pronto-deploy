import prisma from '../services/prismaClient.js';

const parseEntityId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const listarMetas = async (req, res) => {
  try {
    const metas = await prisma.meta.findMany({
      where: { userId: req.user.id },
      orderBy: { prazo: 'asc' },
    });
    return res.json(metas);
  } catch (err) {
    console.error('listarMetas error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const criarMeta = async (req, res) => {
  try {
    const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : '';
    const valorAlvo = parseNumber(req.body?.valorAlvo);
    const prazo = new Date(req.body?.prazo);

    if (!nome || valorAlvo === null || !req.body?.prazo) {
      return res.status(400).json({ error: 'nome, valorAlvo e prazo sao obrigatorios' });
    }
    if (valorAlvo <= 0) {
      return res.status(400).json({ error: 'valorAlvo deve ser maior que zero' });
    }
    if (Number.isNaN(prazo.getTime())) {
      return res.status(400).json({ error: 'prazo invalido' });
    }

    const meta = await prisma.meta.create({
      data: { userId: req.user.id, nome, valorAlvo, prazo },
    });
    return res.status(201).json(meta);
  } catch (err) {
    console.error('criarMeta error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const atualizarMeta = async (req, res) => {
  try {
    const id = parseEntityId(req.params.id);
    const valorAtual = parseNumber(req.body?.valorAtual);

    if (!id) {
      return res.status(400).json({ error: 'Id invalido' });
    }
    if (valorAtual === null || valorAtual < 0) {
      return res.status(400).json({ error: 'valorAtual invalido' });
    }

    const existente = await prisma.meta.findFirst({ where: { id, userId: req.user.id } });
    if (!existente) {
      return res.status(404).json({ error: 'Meta nao encontrada' });
    }

    const meta = await prisma.meta.update({ where: { id }, data: { valorAtual } });
    return res.json(meta);
  } catch (err) {
    console.error('atualizarMeta error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const deletarMeta = async (req, res) => {
  try {
    const id = parseEntityId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Id invalido' });
    }

    const existente = await prisma.meta.findFirst({ where: { id, userId: req.user.id } });
    if (!existente) {
      return res.status(404).json({ error: 'Meta nao encontrada' });
    }

    await prisma.meta.delete({ where: { id } });
    return res.json({ message: 'Meta removida' });
  } catch (err) {
    console.error('deletarMeta error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
