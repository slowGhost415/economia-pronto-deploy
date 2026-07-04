import prisma from '../services/prismaClient.js';

const parseRequiredString = (value) => (typeof value === 'string' ? value.trim() : '');

export const logInteraction = async (req, res) => {
  try {
    const tipo_acao = parseRequiredString(req.body?.tipo_acao);
    const descricao = parseRequiredString(req.body?.descricao);

    if (!tipo_acao || !descricao) {
      return res.status(400).json({ error: 'tipo_acao e descricao sao obrigatorios' });
    }

    const interaction = await prisma.interaction.create({
      data: {
        userId: req.user.id,
        tipo_acao,
        descricao,
      },
    });

    return res.status(201).json({ message: 'Acao registrada', interaction });
  } catch (err) {
    console.error('logInteraction error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const interactions = await prisma.interaction.findMany({
      where: { userId: req.user.id },
      orderBy: { data: 'desc' },
    });
    return res.json(interactions);
  } catch (err) {
    console.error('getHistory error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
