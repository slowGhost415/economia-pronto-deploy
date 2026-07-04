import prisma from '../services/prismaClient.js';

const parsePositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDateInput = (value) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseEntityId = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const listarTransacoes = async (req, res) => {
  try {
    const { tipo, categoria, mes } = req.query;
    const where = { userId: req.user.id };

    if (tipo) where.tipo = tipo;
    if (categoria) where.categoria = categoria;
    if (mes) {
      const inicio = new Date(`${mes}-01T00:00:00.000Z`);
      if (Number.isNaN(inicio.getTime())) {
        return res.status(400).json({ error: 'Mes invalido' });
      }

      const fim = new Date(inicio);
      fim.setUTCMonth(fim.getUTCMonth() + 1);
      where.data = { gte: inicio, lt: fim };
    }

    const transacoes = await prisma.transacao.findMany({
      where,
      orderBy: { data: 'desc' },
    });
    return res.json(transacoes);
  } catch (err) {
    console.error('listarTransacoes error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const criarTransacao = async (req, res) => {
  try {
    const tipo = typeof req.body?.tipo === 'string' ? req.body.tipo.trim() : '';
    const categoria = typeof req.body?.categoria === 'string' ? req.body.categoria.trim() : '';
    const descricao = typeof req.body?.descricao === 'string' ? req.body.descricao.trim() : '';
    const valor = parsePositiveNumber(req.body?.valor);
    const data = parseDateInput(req.body?.data);

    if (!tipo || !categoria || !descricao || valor === null) {
      return res.status(400).json({ error: 'tipo, categoria, descricao e valor sao obrigatorios' });
    }
    if (!['receita', 'despesa'].includes(tipo)) {
      return res.status(400).json({ error: 'tipo deve ser receita ou despesa' });
    }
    if (valor <= 0) {
      return res.status(400).json({ error: 'valor deve ser maior que zero' });
    }
    if (!data) {
      return res.status(400).json({ error: 'data invalida' });
    }

    const transacao = await prisma.transacao.create({
      data: {
        userId: req.user.id,
        tipo,
        categoria,
        descricao,
        valor,
        data,
      },
    });

    return res.status(201).json(transacao);
  } catch (err) {
    console.error('criarTransacao error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const deletarTransacao = async (req, res) => {
  try {
    const id = parseEntityId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Id invalido' });
    }

    const existente = await prisma.transacao.findFirst({ where: { id, userId: req.user.id } });
    if (!existente) {
      return res.status(404).json({ error: 'Transacao nao encontrada' });
    }

    await prisma.transacao.delete({ where: { id } });
    return res.json({ message: 'Transacao removida' });
  } catch (err) {
    console.error('deletarTransacao error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const resumoFinanceiro = async (req, res) => {
  try {
    const transacoes = await prisma.transacao.findMany({ where: { userId: req.user.id } });
    const receitas = transacoes
      .filter((transacao) => transacao.tipo === 'receita')
      .reduce((soma, transacao) => soma + transacao.valor, 0);
    const despesas = transacoes
      .filter((transacao) => transacao.tipo === 'despesa')
      .reduce((soma, transacao) => soma + transacao.valor, 0);
    const saldo = receitas - despesas;

    const gastosPorCategoria = {};
    transacoes
      .filter((transacao) => transacao.tipo === 'despesa')
      .forEach((transacao) => {
        gastosPorCategoria[transacao.categoria] =
          (gastosPorCategoria[transacao.categoria] || 0) + transacao.valor;
      });

    const alertas = [];
    Object.entries(gastosPorCategoria).forEach(([categoria, valor]) => {
      if (receitas > 0 && valor > receitas * 0.4) {
        alertas.push(`Gastos elevados em "${categoria}": R$ ${valor.toFixed(2)}`);
      }
    });

    return res.json({ receitas, despesas, saldo, gastosPorCategoria, alertas, total: transacoes.length });
  } catch (err) {
    console.error('resumoFinanceiro error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
