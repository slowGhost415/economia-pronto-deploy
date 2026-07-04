import { useEffect, useState } from 'react';
import { getSystemDashboard, performSystemAction } from '../services/systemService';

const Dashboard = ({ user, setNotification }) => {
  const [historic, setHistoric] = useState([]);

  const fetchHistoric = async () => {
    try {
      const data = await getSystemDashboard();
      setHistoric(data.interactions || []);
    } catch (err) {
      setNotification({ type: 'error', message: 'Falha ao buscar histórico' });
    }
  };

  useEffect(() => {
    fetchHistoric();
  }, []);

  const executeAction = async (tipo_acao, descricao) => {
    try {
      await performSystemAction({ tipo_acao, descricao });
      setNotification({ type: 'success', message: `${tipo_acao} registrado` });
      await fetchHistoric();
    } catch (err) {
      setNotification({ type: 'error', message: 'Falha ao registrar ação' });
    }
  };

  return (
    <main className="dashboard">
      <h2>Bem vindo, {user.nome}</h2>
      <section className="widgets">
        <div className="card">
          <h3>Pesquisa</h3>
          <p>Simulação de busca de dados econômicos</p>
          <button onClick={() => executeAction('pesquisa', 'Pesquisa de inflação')}>Fazer pesquisa</button>
        </div>

        <div className="card">
          <h3>Gráfico</h3>
          <p>Visualização dos indicadores</p>
          <button onClick={() => executeAction('visualização', 'Gráfico de PIB exibido')}>Ver gráfico</button>
        </div>

        <div className="card">
          <h3>Simulador</h3>
          <p>Ferramenta de simulação de taxa de juros</p>
          <button onClick={() => executeAction('simulação', 'Simulador rodado com juros 5%')}>Executar simulador</button>
        </div>
      </section>

      <section className="history">
        <h3>Histórico de Interações</h3>
        <ul>
          {historic.map((item) => (
            <li key={item.id}>
              <strong>{item.tipo_acao}</strong> - {item.descricao} <em>{new Date(item.data).toLocaleString()}</em>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default Dashboard;
