import api from './api';

export const signup = async ({ nome, email, senha }) => {
  const res = await api.post('/auth/signup', { nome, email, senha });
  return res.data;
};

export const login = async ({ email, senha }) => {
  const res = await api.post('/auth/login', { email, senha });
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

export const logAction = async ({ tipo_acao, descricao }) => {
  const res = await api.post('/interactions/log', { tipo_acao, descricao });
  return res.data;
};

export const history = async () => {
  const res = await api.get('/interactions/history');
  return res.data;
};
