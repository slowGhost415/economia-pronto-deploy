import prisma from '../services/prismaClient.js';

const parseRequiredString = (value) => (typeof value === 'string' ? value.trim() : '');

export const getSystemDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, email: true, data_criacao: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }

    const interactions = await prisma.interaction.findMany({
      where: { userId },
      orderBy: { data: 'desc' },
    });

    return res.json({ user, interactions });
  } catch (err) {
    console.error('getSystemDashboard error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const performAction = async (req, res) => {
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

    return res.status(201).json({ message: 'Acao registrada no sistema', interaction });
  } catch (err) {
    console.error('performAction error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
