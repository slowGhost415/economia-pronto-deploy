import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../src/services/prismaClient.js';
import { signup, login } from '../src/controllers/authController.js';
import { criarTransacao, listarTransacoes } from '../src/controllers/transacaoController.js';
import { criarMeta, atualizarMeta } from '../src/controllers/metaController.js';
import { criarInvestimento, deletarInvestimento } from '../src/controllers/investimentoController.js';
import authMiddleware from '../src/middlewares/authMiddleware.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return res;
};

const originalMethods = {
  userFindUnique: prisma.user.findUnique,
  userCreate: prisma.user.create,
  transacaoCreate: prisma.transacao.create,
  transacaoFindMany: prisma.transacao.findMany,
  metaCreate: prisma.meta.create,
  metaFindFirst: prisma.meta.findFirst,
  metaUpdate: prisma.meta.update,
  investimentoCreate: prisma.investimento.create,
  investimentoFindFirst: prisma.investimento.findFirst,
  investimentoDelete: prisma.investimento.delete,
};

test.after(() => {
  prisma.user.findUnique = originalMethods.userFindUnique;
  prisma.user.create = originalMethods.userCreate;
  prisma.transacao.create = originalMethods.transacaoCreate;
  prisma.transacao.findMany = originalMethods.transacaoFindMany;
  prisma.meta.create = originalMethods.metaCreate;
  prisma.meta.findFirst = originalMethods.metaFindFirst;
  prisma.meta.update = originalMethods.metaUpdate;
  prisma.investimento.create = originalMethods.investimentoCreate;
  prisma.investimento.findFirst = originalMethods.investimentoFindFirst;
  prisma.investimento.delete = originalMethods.investimentoDelete;
});

test('signup normaliza email e retorna token', async () => {
  prisma.user.findUnique = async ({ where }) => {
    assert.equal(where.email, 'teste@exemplo.com');
    return null;
  };
  prisma.user.create = async ({ data }) => ({
    id: 1,
    nome: data.nome,
    email: data.email,
    senha: data.senha,
  });

  const req = { body: { nome: ' Ana ', email: ' TESTE@EXEMPLO.COM ', senha: 'Teste1234' } };
  const res = createMockRes();

  await signup(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.user.email, 'teste@exemplo.com');
  assert.ok(res.body.token);
});

test('login rejeita senha invalida', async () => {
  const senhaHash = await bcrypt.hash('correta', 4);
  prisma.user.findUnique = async () => ({
    id: 2,
    nome: 'User',
    email: 'user@teste.com',
    senha: senhaHash,
  });

  const req = { body: { email: 'user@teste.com', senha: 'errada' } };
  const res = createMockRes();

  await login(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'Credenciais invalidas');
});

test('criarTransacao rejeita data invalida', async () => {
  const req = {
    user: { id: 1 },
    body: { tipo: 'receita', categoria: 'Salario', descricao: 'Pagamento', valor: 100, data: 'invalida' },
  };
  const res = createMockRes();

  await criarTransacao(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'data invalida');
});

test('listarTransacoes rejeita mes invalido', async () => {
  const req = { user: { id: 1 }, query: { mes: '2026-13' } };
  const res = createMockRes();

  await listarTransacoes(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Mes invalido');
});

test('criarMeta rejeita valor alvo zerado', async () => {
  const req = { user: { id: 1 }, body: { nome: 'Reserva', valorAlvo: 0, prazo: '2026-12-01' } };
  const res = createMockRes();

  await criarMeta(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'valorAlvo deve ser maior que zero');
});

test('atualizarMeta rejeita id invalido', async () => {
  const req = { user: { id: 1 }, params: { id: 'abc' }, body: { valorAtual: 10 } };
  const res = createMockRes();

  await atualizarMeta(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Id invalido');
});

test('criarInvestimento rejeita taxa negativa', async () => {
  const req = {
    user: { id: 1 },
    body: { nome: 'CDB', tipo: 'Renda Fixa', valor: 1000, taxa: -1 },
  };
  const res = createMockRes();

  await criarInvestimento(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'taxa nao pode ser negativa');
});

test('deletarInvestimento rejeita recurso ausente', async () => {
  prisma.investimento.findFirst = async () => null;

  const req = { user: { id: 1 }, params: { id: '3' } };
  const res = createMockRes();

  await deletarInvestimento(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.error, 'Investimento nao encontrado');
});

test('authMiddleware injeta usuario valido no request', async () => {
  const token = jwt.sign({ id: 9, nome: 'Ana', email: 'ana@teste.com' }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createMockRes();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { id: 9, nome: 'Ana', email: 'ana@teste.com' });
});
