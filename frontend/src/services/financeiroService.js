import api from './api';

export const listarTransacoes = async (filtros = {}) => {
  const res = await api.get('/transacoes', { params: filtros });
  return res.data;
};

export const criarTransacao = async (dados) => {
  const res = await api.post('/transacoes', dados);
  return res.data;
};

export const deletarTransacao = async (id) => {
  const res = await api.delete(`/transacoes/${id}`);
  return res.data;
};

export const resumoFinanceiro = async () => {
  const res = await api.get('/transacoes/resumo');
  return res.data;
};

export const listarMetas = async () => {
  const res = await api.get('/metas');
  return res.data;
};

export const criarMeta = async (dados) => {
  const res = await api.post('/metas', dados);
  return res.data;
};

export const atualizarMeta = async (id, valorAtual) => {
  const res = await api.patch(`/metas/${id}`, { valorAtual });
  return res.data;
};

export const deletarMeta = async (id) => {
  const res = await api.delete(`/metas/${id}`);
  return res.data;
};

export const listarInvestimentos = async () => {
  const res = await api.get('/investimentos');
  return res.data;
};

export const criarInvestimento = async (dados) => {
  const res = await api.post('/investimentos', dados);
  return res.data;
};

export const deletarInvestimento = async (id) => {
  const res = await api.delete(`/investimentos/${id}`);
  return res.data;
};
