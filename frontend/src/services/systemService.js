import api from './api';

export const getSystemDashboard = async () => {
  const res = await api.get('/system/dashboard');
  return res.data;
};

export const performSystemAction = async ({ tipo_acao, descricao }) => {
  const res = await api.post('/system/action', { tipo_acao, descricao });
  return res.data;
};
