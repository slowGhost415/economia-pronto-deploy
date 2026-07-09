import { useMemo, useState } from 'react';

const ANSWERS = {
  selic: 'A Selic e a taxa basica de juros. Quando ela sobe, credito fica mais caro e investimentos de renda fixa tendem a render mais. Quando cai, consumo e financiamentos costumam ganhar folego.',
  ipca: 'O IPCA mede inflacao ao consumidor. Se ele sobe, o poder de compra cai. No site, ele ajuda a entender por que produtos essenciais mudam de preco.',
  grafico: 'No grafico, compare produtos, Selic e IPCA. Linhas que sobem juntas indicam pressao comum, como combustivel, cambio, energia ou sazonalidade.',
  impostos: 'A calculadora soma preco base, frete e aliquotas como II, IPI, PIS, COFINS e ICMS. Ela estima o preco cheio e mostra quanto do total vem de impostos.',
  investimento: 'No simulador, juros compostos mostram o efeito do tempo. Aportes mensais costumam ser mais importantes do que tentar acertar a taxa perfeita.',
  seguranca: 'A seguranca combina token JWT, expiracao de sessao, CORS controlado, headers HTTP com Helmet e limite de requisicoes para reduzir abuso em login e API.',
};

const detect = (question) => {
  const q = question.toLowerCase();
  if (q.includes('selic') || q.includes('juros')) return 'selic';
  if (q.includes('ipca') || q.includes('inflacao') || q.includes('inflação')) return 'ipca';
  if (q.includes('grafico') || q.includes('grafico') || q.includes('analise')) return 'grafico';
  if (q.includes('imposto') || q.includes('icms') || q.includes('cofins') || q.includes('preco')) return 'impostos';
  if (q.includes('invest') || q.includes('aporte') || q.includes('rendimento')) return 'investimento';
  if (q.includes('segur') || q.includes('token') || q.includes('login')) return 'seguranca';
  return 'selic';
};

const AIAssistant = () => {
  const [question, setQuestion] = useState('Como a Selic afeta meus gastos?');
  const answerKey = useMemo(() => detect(question), [question]);
  const chips = [
    'O que e Selic?',
    'Como calcular impostos?',
    'Explique o grafico',
    'Como investir melhor?',
    'O site e seguro?',
  ];

  return (
    <section className="ai-panel">
      <div className="ai-avatar">
        <span />
      </div>
      <div className="ai-content">
        <span className="eyebrow">Assistente de leitura economica</span>
        <h2>Entenda o que cada indicador revela</h2>
        <p>Este assistente interpreta perguntas sobre economia, impostos, graficos, investimentos e seguranca com respostas locais e objetivas.</p>

        <div className="ai-question-row">
          <input className="ec-input" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <button className="ec-btn" type="button">Explicar</button>
        </div>

        <div className="ai-chips">
          {chips.map((chip) => (
            <button key={chip} type="button" onClick={() => setQuestion(chip)}>{chip}</button>
          ))}
        </div>

        <div className="ai-answer">
          {ANSWERS[answerKey]}
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
