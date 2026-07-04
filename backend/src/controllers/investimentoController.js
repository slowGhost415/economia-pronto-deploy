import prisma from '../services/prismaClient.js';

const parseEntityId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const listarInvestimentos = async (req, res) => {
  try {
    const investimentos = await prisma.investimento.findMany({
      where: { userId: req.user.id },
      orderBy: { data_inicio: 'desc' },
    });
    return res.json(investimentos);
  } catch (err) {
    console.error('listarInvestimentos error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const criarInvestimento = async (req, res) => {
  try {
    const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : '';
    const tipo = typeof req.body?.tipo === 'string' ? req.body.tipo.trim() : '';
    const valor = parseNumber(req.body?.valor);
    const taxa = parseNumber(req.body?.taxa);

    if (!nome || !tipo || valor === null || taxa === null) {
      return res.status(400).json({ error: 'nome, tipo, valor e taxa sao obrigatorios' });
    }
    if (valor <= 0) {
      return res.status(400).json({ error: 'valor deve ser maior que zero' });
    }
    if (taxa < 0) {
      return res.status(400).json({ error: 'taxa nao pode ser negativa' });
    }

    const investimento = await prisma.investimento.create({
      data: { userId: req.user.id, nome, tipo, valor, taxa },
    });
    return res.status(201).json(investimento);
  } catch (err) {
    console.error('criarInvestimento error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const deletarInvestimento = async (req, res) => {
  try {
    const id = parseEntityId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Id invalido' });
    }

    const existente = await prisma.investimento.findFirst({ where: { id, userId: req.user.id } });
    if (!existente) {
      return res.status(404).json({ error: 'Investimento nao encontrado' });
    }

    await prisma.investimento.delete({ where: { id } });
    return res.json({ message: 'Investimento removido' });
  } catch (err) {
    console.error('deletarInvestimento error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
